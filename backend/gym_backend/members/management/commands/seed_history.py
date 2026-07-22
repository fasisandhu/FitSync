"""Backfill historical attendance and payments so the demo trend charts show
months of data. Idempotent: only backfills when historical rows are absent, so
it is safe to run on every container boot.

Attendance `date`/`time` and Payment `payment_date` are auto_now_add fields, so
we temporarily disable auto_now_add to insert dated rows via bulk_create.
"""
import random
from contextlib import contextmanager
from datetime import date, timedelta, time as dtime

from django.core.management.base import BaseCommand

from members.models import Member
from attendance.models import Attendance
from subscriptions.models import Subscription, Payment


@contextmanager
def _writable_auto_fields(*fields):
    """Temporarily disable auto_now_add on the given model fields."""
    saved = [(f, f.auto_now_add) for f in fields]
    for f in fields:
        f.auto_now_add = False
    try:
        yield
    finally:
        for f, prev in saved:
            f.auto_now_add = prev


class Command(BaseCommand):
    help = "Backfill historical attendance + payments for demo trend charts (idempotent)."

    def handle(self, *args, **options):
        today = date.today()
        first_of_month = today.replace(day=1)
        members = list(Member.objects.all().order_by("id"))

        if not members:
            self.stdout.write("seed_history: no members found — skipping (run API seed first).")
            return

        att_created = self._backfill_attendance(today, members)
        pay_created = self._backfill_payments(today, first_of_month)
        self.stdout.write(
            f"seed_history: +{att_created} attendance, +{pay_created} payments"
        )

    # -- Attendance over the last 45 days (Daily Trend + Peak Hours) ------------
    def _backfill_attendance(self, today, members):
        if Attendance.objects.filter(date__lt=today - timedelta(days=1)).exists():
            self.stdout.write("seed_history: historical attendance present — skipping.")
            return 0

        rng = random.Random(42)
        existing = set(Attendance.objects.values_list("member_id", "date"))
        objs = []
        for day_offset in range(1, 46):
            day = today - timedelta(days=day_offset)
            attend_rate = 0.55 if day.weekday() >= 5 else 0.82  # lighter weekends
            for m in members:
                if rng.random() > attend_rate:
                    continue
                key = (m.id, day)
                if key in existing:
                    continue
                existing.add(key)
                # Cluster check-ins into morning and evening peaks
                if rng.random() < 0.5:
                    hour = rng.choice([6, 7, 7, 8, 8, 9])
                else:
                    hour = rng.choice([17, 18, 18, 19, 19, 20])
                status = "present" if rng.random() < 0.85 else "late"
                objs.append(Attendance(
                    member=m, date=day, time=dtime(hour, rng.randint(0, 59)),
                    status=status, remarks="Historical check-in",
                ))

        with _writable_auto_fields(
            Attendance._meta.get_field("date"),
            Attendance._meta.get_field("time"),
        ):
            Attendance.objects.bulk_create(objs, batch_size=200)
        return len(objs)

    # -- Payments spread across the previous 5 months (Revenue trend) -----------
    def _backfill_payments(self, today, first_of_month):
        if Payment.objects.filter(payment_date__lt=first_of_month).exists():
            self.stdout.write("seed_history: historical payments present — skipping.")
            return 0

        subs = list(Subscription.objects.select_related("member", "plan").all())
        if not subs:
            return 0

        rng = random.Random(7)
        objs = []
        for month_offset in range(1, 6):  # 1..5 months ago
            y, mo = first_of_month.year, first_of_month.month - month_offset
            while mo <= 0:
                mo += 12
                y -= 1
            sample = rng.sample(subs, min(len(subs), rng.randint(4, 8)))
            for s in sample:
                pay_day = date(y, mo, rng.randint(1, 27))
                amount = s.plan.price if s.plan else 5000
                p = Payment(
                    subscription=s, amount=amount, status="paid",
                    method=rng.choice(["cash", "bank"]), payment_date=pay_day,
                )
                # Populate denormalized fields (bulk_create skips Model.save()).
                if s.member:
                    p.member_name = s.member.full_name or ""
                    p.member_email = s.member.email or ""
                if s.plan:
                    p.subscription_plan_name = s.plan.name
                p.subscription_start_date = s.start_date
                p.subscription_end_date = s.end_date
                objs.append(p)

        with _writable_auto_fields(Payment._meta.get_field("payment_date")):
            Payment.objects.bulk_create(objs, batch_size=200)
        return len(objs)
