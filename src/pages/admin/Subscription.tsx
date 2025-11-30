import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useTitle } from '@/context/TitleContext';

export default function Subscription() {
  useAuth("adminSubscription");
  const { toast } = useToast();
  const { t } = useTranslation();
  const {setTitle} = useTitle();
  useEffect(() => {
    setTitle(t("admin.subscription.title"));           // set header title for this page
    return () => setTitle('Business Dashboard'); // optional reset on unmount
  }, [setTitle]);

  // Dummy data (to be replaced with actual data)
  const currentPlan = "gold";
  const plans = [
    {
      id: 1,
      name: t("admin.subscription.plans.silver.name"),
      price: 29,
      maxStaff: 2,
      maxProducts: 500,
      features: [
        { name: t("admin.subscription.plans.silver.features.basic_pos"), included: true },
        { name: t("admin.subscription.plans.silver.features.customer_management"), included: true },
        { name: t("admin.subscription.plans.silver.features.supplier_management"), included: true },
        { name: t("admin.subscription.plans.silver.features.barcode_scanning"), included: true },
        { name: t("admin.subscription.plans.silver.features.basic_reports"), included: true },
        { name: t("admin.subscription.plans.silver.features.advanced_analytics"), included: true },
        { name: t("admin.subscription.plans.silver.features.loyalty_program"), included: false },
        { name: t("admin.subscription.plans.silver.features.gift_cards"), included: false },
        { name: t("admin.subscription.plans.silver.features.purchase_order"), included: false },
        { name: t("admin.subscription.plans.silver.features.multi_warehouse"), included: false },
        { name: t("admin.subscription.plans.silver.features.api_access"), included: false },
        { name: t("admin.subscription.plans.silver.features.premium_support"), included: false },
      ],
      
    },
    {
      id: 2,
      name: t("admin.subscription.plans.gold.name"),
      price: 59,
      maxStaff: 5,
      maxProducts: 2000,
      features: [
        { name: t("admin.subscription.plans.silver.features.basic_pos"), included: true },
        { name: t("admin.subscription.plans.silver.features.customer_management"), included: true },
        { name: t("admin.subscription.plans.silver.features.supplier_management"), included: true },
        { name: t("admin.subscription.plans.silver.features.barcode_scanning"), included: true },
        { name: t("admin.subscription.plans.silver.features.basic_reports"), included: true },
        { name: t("admin.subscription.plans.silver.features.advanced_analytics"), included: false },
        { name: t("admin.subscription.plans.silver.features.loyalty_program"), included: false },
        { name: t("admin.subscription.plans.silver.features.gift_cards"), included: false },
        { name: t("admin.subscription.plans.silver.features.purchase_order"), included: false },
        { name: t("admin.subscription.plans.silver.features.multi_warehouse"), included: false },
        { name: t("admin.subscription.plans.silver.features.api_access"), included: false },
        { name: t("admin.subscription.plans.silver.features.premium_support"), included: false },
      ],
      
    },
    {
      id: 3,
      name: t("admin.subscription.plans.platinum.name"),
      price: 119,
      maxStaff: "Unlimited",
      maxProducts: "Unlimited",
      features: [
        { name: t("admin.subscription.plans.silver.features.basic_pos"), included: true },
        { name: t("admin.subscription.plans.silver.features.customer_management"), included: true },
        { name: t("admin.subscription.plans.silver.features.supplier_management"), included: true },
        { name: t("admin.subscription.plans.silver.features.barcode_scanning"), included: true },
        { name: t("admin.subscription.plans.silver.features.basic_reports"), included: true },
        { name: t("admin.subscription.plans.silver.features.advanced_analytics"), included: true },
        { name: t("admin.subscription.plans.silver.features.loyalty_program"), included: true },
        { name: t("admin.subscription.plans.silver.features.gift_cards"), included: true },
        { name: t("admin.subscription.plans.silver.features.purchase_order"), included: true },
        { name: t("admin.subscription.plans.silver.features.multi_warehouse"), included: true },
        { name: t("admin.subscription.plans.silver.features.api_access"), included: true },
        { name: t("admin.subscription.plans.silver.features.premium_support"), included: true },
      ],
      
    }
  ];

  return (
    <div className="space-y-6">

      <Card className="p-6 bg-gradient-to-br from-primary to-chart-2">
        <div className="flex items-start justify-between text-primary-foreground">
          <div>
            <h3 className="text-xl font-semibold mb-2">{t("admin.subscription.current_plan_card.heading")}</h3>
            <p className="text-3xl font-bold capitalize">{currentPlan}</p>
            <p className="mt-2 opacity-90">{t("admin.subscription.current_plan_card.active_until")} Dec 31, 2025</p>
          </div>
          <Crown className="w-12 h-12 opacity-80" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan;
          return (
            <Card key={plan.id} className={isCurrent ? "border-primary border-2" : ""}>
              <div className="p-6 space-y-4">
                <div>
                  {isCurrent && <Badge className="mb-2">Current Plan</Badge>}
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">{t("admin.subscription.plans.silver.price_label")}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center text-sm">
                    <span className="font-medium">{t("admin.subscription.plans.silver.max_staff")}</span>
                    <span className="ml-auto">{plan.maxStaff}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium">{t("admin.subscription.plans.silver.max_products")}</span>
                    <span className="ml-auto">{plan.maxProducts}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Check
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${feature.included ? "text-chart-4" : "text-gray-400"}`}
                        />
                        <span className={`${feature.included ? "" : "text-gray-400"}`}>{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant={isCurrent ? "outline" : "default"}
                  className="w-full mt-4"
                  disabled={isCurrent}
                  onClick={() =>
                    toast({
                      title: "Upgrade Plan",
                      description: `Upgrading to ${plan.name}`,
                    })
                  }
                  data-testid={`button-${isCurrent ? "current" : "upgrade"}-plan-${plan.id}`}
                >
                  {isCurrent ? t("admin.subscription.labels.current_plan") : t("admin.subscription.labels.upgrade")}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
