import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useExpenses, useDeleteExpense, useCreateExpense } from '@/hooks/useApi';
import { Expense, ExpenseFilters } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import ExpenseForm from './ExpenseForm';

const ExpenseManagement: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [expenseDetails, setExpenseDetails] = useState<Expense | null>(null);

  // Frontend filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [personNameFilter, setPersonNameFilter] = useState('');

  // Get expenses with backend filters (date range)
  const { data: allExpensesData, isLoading, error } = useExpenses(filters);
  const deleteExpenseMutation = useDeleteExpense();
  const createExpenseMutation = useCreateExpense();

  const allExpenses = allExpensesData?.results || [];

  // Apply frontend filtering
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(expense => {
      // Search filter (expense name, person name, details)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        expense.expense_name.toLowerCase().includes(searchLower) ||
        expense.person_name.toLowerCase().includes(searchLower) ||
        (expense.details && expense.details.toLowerCase().includes(searchLower));

      // Person name filter
      const personLower = personNameFilter.toLowerCase();
      const matchesPerson = !personNameFilter || 
        expense.person_name.toLowerCase().includes(personLower);

      return matchesSearch && matchesPerson;
    });
  }, [allExpenses, searchTerm, personNameFilter]);

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setShowForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteDialog(true);
  };

  const handleViewDetails = (expense: Expense) => {
    setExpenseDetails(expense);
    setShowDetailsDialog(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpenseMutation.mutateAsync(expenseToDelete.id);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      setShowDeleteDialog(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (field: keyof ExpenseFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value && value.trim() !== '' ? value : undefined
    }));
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedExpense(null);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <h3 className="text-lg font-semibold mb-2">Error loading expenses</h3>
              <p className="text-sm mb-4">
                {error.message || 'Failed to load expenses from the server'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Expense Management</h1>
        <Button onClick={handleAddExpense}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Person Name</label>
              <Input
                placeholder="Filter by person..."
                value={personNameFilter}
                onChange={(e) => setPersonNameFilter(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredExpenses.length} of {allExpenses.length} expenses
              {searchTerm || personNameFilter ? ` (filtered)` : ''}
            </p>
            <div className="text-sm text-gray-500">
              Status: {isLoading ? 'Loading...' : error ? 'Error' : 'Ready'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || personNameFilter ? 
                'No expenses match your search criteria.' : 
                'No expenses found. Create your first expense to get started.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense Name</TableHead>
                    <TableHead>Person</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {expense.expense_name}
                      </TableCell>
                      <TableCell>{expense.person_name}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(expense)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Form Dialog */}
      {showForm && (
        <ExpenseForm
          expense={selectedExpense}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{expenseToDelete?.expense_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteExpenseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteExpenseMutation.isPending}
            >
              {deleteExpenseMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {expenseDetails && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Expense Name</label>
                <p className="text-lg font-semibold">{expenseDetails.expense_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Person Name</label>
                <p className="text-lg">{expenseDetails.person_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(expenseDetails.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-lg">{formatDate(expenseDetails.date)}</p>
              </div>
              {expenseDetails.details && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Details</label>
                  <p className="text-lg">{expenseDetails.details}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm">{new Date(expenseDetails.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseManagement; 