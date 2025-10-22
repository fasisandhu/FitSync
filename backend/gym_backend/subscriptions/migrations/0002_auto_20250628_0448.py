from django.db import migrations, models

class Migration(migrations.Migration):
    
    dependencies = [
        ('subscriptions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='member_email',
            field=models.EmailField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='payment',
            name='subscription_start_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='subscription_end_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]