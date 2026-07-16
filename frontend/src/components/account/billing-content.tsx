"use client";

import { Check, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Static plan data; Stripe wiring is stubbed until the billing API exists.
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tokenQuota: "50k tokens / mo",
    features: ["5 blogs per month", "Basic templates", "Markdown export"],
    current: true,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    tokenQuota: "500k tokens / mo",
    features: [
      "Unlimited blogs",
      "All templates & SEO tools",
      "Medium publishing",
      "Featured image generation",
    ],
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$29",
    period: "per month",
    tokenQuota: "2M tokens / mo",
    features: [
      "Everything in Pro",
      "Scheduled publishing",
      "Analytics history",
      "Priority support",
    ],
  },
];

const TOKENS_USED = 32_450;
const TOKEN_QUOTA = 50_000;

export function BillingContent() {
  const usedPct = Math.round((TOKENS_USED / TOKEN_QUOTA) * 100);

  function handleUpgrade(plan: string) {
    toast.info(`Payments are stubbed in this build — ${plan} checkout arrives with the billing API.`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="glass max-w-2xl">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <Cpu className="size-4.5 text-primary" aria-hidden />
            AI token usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="font-display text-2xl font-semibold tabular-nums">
              {TOKENS_USED.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {TOKEN_QUOTA.toLocaleString()} tokens
              </span>
            </p>
            <p className="text-sm text-muted-foreground">{usedPct}% used</p>
          </div>
          <Progress value={usedPct} aria-label="Token usage" />
          <p className="mt-2 text-xs text-muted-foreground">
            Quota resets on the 1st of each month. Upgrade for more headroom.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "glass relative",
              plan.highlighted && "border-primary/40 shadow-lg"
            )}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
              <p>
                <span className="font-display text-3xl font-semibold">
                  {plan.price}
                </span>{" "}
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              <p className="text-xs font-medium text-primary">{plan.tokenQuota}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.current ? (
                <Button variant="outline" disabled className="w-full">
                  Current plan
                </Button>
              ) : (
                <Button
                  variant={plan.highlighted ? "default" : "secondary"}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.name)}
                >
                  Upgrade to {plan.name}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
