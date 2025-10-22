import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateExpense, useUpdateExpense } from '@/hooks/useApi';
import { Expense, CreateExpenseRequest } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  expense?: Expense | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    expense_name: '',
    person_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    details: ''
  });

  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();

  useEffect(() => {
    if (expense) {
      setFormData({
        expense_name: expense.expense_name,
        person_name: expense.person_name,
        amount: expense.amount,
        date: expense.date,
        details: expense.details || ''
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (expense) {
        await updateExpenseMutation.mutateAsync({
          id: expense.id,
          data: formData
        });
        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        await createExpenseMutation.mutateAsync(formData);
        toast({
          title: "Success",
          description: "Expense created successfully",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isLoading = createExpenseMutation.isPending || updateExpenseMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_name">Expense Name *</Label>
              <Input
                id="expense_name"
                value={formData.expense_name}
                onChange={(e) => handleInputChange('expense_name', e.target.value)}
                placeholder="e.g., Office Supplies"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="person_name">Person Name *</Label>
              <Input
                id="person_name"
                value={formData.person_name}
                onChange={(e) => handleInputChange('person_name', e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => handleInputChange('details', e.target.value)}
              placeholder="Additional details about the expense..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (expense ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseForm; 