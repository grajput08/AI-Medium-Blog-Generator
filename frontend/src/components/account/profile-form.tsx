"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSessionUser, initials, setSession } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email address"),
  bio: z.string().max(280, "Keep your bio under 280 characters").optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [pending, setPending] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", bio: "" },
  });

  useEffect(() => {
    const user = getSessionUser();
    if (user) form.reset({ name: user.name, email: user.email, bio: "" });
  }, [form]);

  const name = form.watch("name");

  async function onSubmit(values: ProfileValues) {
    setPending(true);
    await new Promise((r) => setTimeout(r, 500));
    setSession({ name: values.name, email: values.email });
    setPending(false);
    toast.success("Profile saved.");
  }

  return (
    <Card className="glass max-w-2xl">
      <CardHeader>
        <CardTitle className="font-display text-lg">Your details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary uppercase">
              {name ? initials(name) : "•"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Profile photo</p>
            <p className="text-xs text-muted-foreground">
              Avatar upload arrives with the real API. Initials for now.
            </p>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="A line or two about what you write."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown on your author card in future sharing features.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
