"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  defaultSettings,
  languages,
  loadSettings,
  saveSettings,
  tones,
  writingStyles,
  type UserSettings,
} from "@/lib/settings";

const autosaveOptions = [
  { value: 15, label: "Every 15 seconds" },
  { value: 30, label: "Every 30 seconds" },
  { value: 60, label: "Every minute" },
  { value: 0, label: "Off" },
];

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  function update<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveSettings(settings);
    toast.success("Settings saved.");
  }

  if (!mounted) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-display text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="theme-select">Theme</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Applies immediately across the app.
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-display text-lg">Writing defaults</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(
            [
              { key: "defaultStyle", label: "Writing style", options: writingStyles },
              { key: "defaultTone", label: "Tone", options: tones },
              { key: "defaultLanguage", label: "Language", options: languages },
            ] as const
          ).map(({ key, label, options }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={key}>{label}</Label>
              <Select
                value={settings[key]}
                onValueChange={(v) => update(key, v)}
              >
                <SelectTrigger id={key} className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="autosave">Autosave drafts</Label>
            <Select
              value={String(settings.autosaveSeconds)}
              onValueChange={(v) => update("autosaveSeconds", Number(v))}
            >
              <SelectTrigger id="autosave" className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {autosaveOptions.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-display text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="email-notifications">Email notifications</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Publishing results and account updates.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(v) => update("emailNotifications", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="publish-reminders">Publishing reminders</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                A nudge when a draft has been idle for a week.
              </p>
            </div>
            <Switch
              id="publish-reminders"
              checked={settings.publishReminders}
              onCheckedChange={(v) => update("publishReminders", v)}
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <Button onClick={handleSave}>Save settings</Button>
      </div>
    </div>
  );
}
