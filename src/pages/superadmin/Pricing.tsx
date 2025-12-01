import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTitle } from '@/context/TitleContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { PricingPlan } from '@shared/schema';

interface PlanFormData {
  name: string;
  price: string;
  maxStaff: string;
  maxProducts: string;
  features: string[];
  isActive: boolean;
}

export default function PricingPlans() {
  useAuth("superAdminPricing");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    setTitle('Pricing Plans');
  }, [setTitle]);

  const [plans, setPlans] = useState<PricingPlan[]>([
    {
      id: 'plan-1',
      name: 'Silver',
      price: '19.99',
      maxStaff: 5,
      maxProducts: 500,
      features: ['Basic POS', 'Sales Reports', 'Email Support'],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'plan-2',
      name: 'Gold',
      price: '39.99',
      maxStaff: 15,
      maxProducts: 2000,
      features: ['Advanced POS', 'Analytics Dashboard', 'Priority Support', 'Multi-Location'],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'plan-3',
      name: 'Premium',
      price: '79.99',
      maxStaff: -1,
      maxProducts: -1,
      features: ['Enterprise POS', 'Custom Reports', '24/7 Support', 'API Access', 'White Label'],
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
  ]);
  
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: '',
    maxStaff: '',
    maxProducts: '',
    features: [],
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      maxStaff: '',
      maxProducts: '',
      features: [],
      isActive: true,
    });
    setFeatureInput('');
    setEditingPlan(null);
  };

  const handleAddPlan = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      maxStaff: plan.maxStaff.toString(),
      maxProducts: plan.maxProducts.toString(),
      features: plan.features || [],
      isActive: plan.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter(p => p.id !== planId));
    toast({
      title: 'Plan Deleted',
      description: 'Pricing plan has been successfully deleted.',
    });
  };

  const handleToggleActive = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, isActive: !p.isActive } : p
    ));
    const plan = plans.find(p => p.id === planId);
    toast({
      title: plan?.isActive ? 'Plan Deactivated' : 'Plan Activated',
      description: `${plan?.name} has been ${plan?.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.maxStaff || !formData.maxProducts) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingPlan) {
      setPlans(plans.map(p => 
        p.id === editingPlan.id 
          ? {
              ...p,
              name: formData.name,
              price: formData.price,
              maxStaff: parseInt(formData.maxStaff),
              maxProducts: parseInt(formData.maxProducts),
              features: formData.features,
              isActive: formData.isActive,
            }
          : p
      ));
      toast({
        title: 'Plan Updated',
        description: `${formData.name} has been successfully updated.`,
      });
    } else {
      const newPlan: PricingPlan = {
        id: `plan-${Date.now()}`,
        name: formData.name,
        price: formData.price,
        maxStaff: parseInt(formData.maxStaff),
        maxProducts: parseInt(formData.maxProducts),
        features: formData.features,
        isActive: formData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPlans([...plans, newPlan]);
      toast({
        title: 'Plan Created',
        description: `${formData.name} has been successfully created.`,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAddPlan} data-testid="button-add-plan">
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-chart-2 p-6 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-sm opacity-90">/month</span>
                  </div>
                </div>
                <Badge 
                  variant={plan.isActive ? "secondary" : "outline"} 
                  className={plan.isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="font-medium">Max Staff:</span>
                  <span className="ml-auto">{plan.maxStaff}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-medium">Max Products:</span>
                  <span className="ml-auto">{plan.maxProducts}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Features</h4>
                <div className="space-y-2">
                  {plan.features?.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-chart-4 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditPlan(plan)}
                  data-testid={`button-edit-plan-${plan.id}`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => handleToggleActive(plan.id)}
                  data-testid={`button-toggle-plan-${plan.id}`}
                >
                  {plan.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeletePlan(plan.id)}
                  data-testid={`button-delete-plan-${plan.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update the pricing plan details below.' : 'Fill in the details to create a new pricing plan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name *</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g., Premium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-plan-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-price">Monthly Price ($) *</Label>
                <Input
                  id="plan-price"
                  type="number"
                  placeholder="e.g., 29.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  data-testid="input-plan-price"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-staff">Max Staff *</Label>
                <Input
                  id="max-staff"
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.maxStaff}
                  onChange={(e) => setFormData({ ...formData, maxStaff: e.target.value })}
                  data-testid="input-max-staff"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-products">Max Products *</Label>
                <Input
                  id="max-products"
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.maxProducts}
                  onChange={(e) => setFormData({ ...formData, maxProducts: e.target.value })}
                  data-testid="input-max-products"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-active">Active Plan</Label>
              <Switch
                id="is-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-is-active"
              />
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature..."
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  data-testid="input-feature"
                />
                <Button onClick={handleAddFeature} type="button" data-testid="button-add-feature">
                  Add
                </Button>
              </div>
              
              {formData.features.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md">
                      <Check className="w-4 h-4 text-chart-4" />
                      <span className="flex-1">{feature}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                        data-testid={`button-remove-feature-${index}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-testid="button-submit-plan">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
