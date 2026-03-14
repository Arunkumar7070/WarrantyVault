import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/services/apiClient";
import { updateProfile } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { shortenAddress } from "@/utils/format";

const schema = z.object({
  name: z.string().optional(),
  email: z.email("Invalid email").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const updated = await updateProfile({ name: values.name, email: values.email });
      setUser(updated);
      toast({ title: "Profile updated", variant: "success" });
    } catch (error) {
      toast({ title: "Update failed", description: apiErrorMessage(error), variant: "destructive" });
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {user.role.replace("_", " ")}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Wallet: <span className="font-mono">{shortenAddress(user.wallet, 6)}</span>
          </p>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" {...register("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
