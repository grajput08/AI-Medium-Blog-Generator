"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Link2,
  PlugZap,
  Send,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { downloadTextFile } from "@/lib/editor/markdown";
import { formatRelative } from "@/lib/format";
import { getSessionUser } from "@/lib/session";

// Mock connection state; the real token exchange is Phase 6/7 API work.
const MEDIUM_KEY = "inkwell.medium";

type MediumConnection = {
  username: string;
  connectedAt: string;
  lastVerifiedAt: string;
};

export function MediumContent() {
  const [connection, setConnection] = useState<MediumConnection | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [when, setWhen] = useState("now");
  const [scheduleAt, setScheduleAt] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEDIUM_KEY);
      if (raw) setConnection(JSON.parse(raw) as MediumConnection);
    } catch {
      // ignore
    }
  }, []);

  async function connect() {
    if (token.trim().length < 8) {
      toast.error("That doesn't look like a valid integration token.");
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    const user = getSessionUser();
    const conn: MediumConnection = {
      username: `@${(user?.name ?? "writer").toLowerCase().replace(/\s+/g, "")}`,
      connectedAt: new Date().toISOString(),
      lastVerifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(MEDIUM_KEY, JSON.stringify(conn));
    setConnection(conn);
    setToken("");
    setBusy(false);
    toast.success("Medium account connected.");
  }

  async function testConnection() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    if (connection) {
      const next = { ...connection, lastVerifiedAt: new Date().toISOString() };
      localStorage.setItem(MEDIUM_KEY, JSON.stringify(next));
      setConnection(next);
    }
    setBusy(false);
    toast.success("Connection healthy — profile fetched.");
  }

  function disconnect() {
    localStorage.removeItem(MEDIUM_KEY);
    setConnection(null);
    toast.success("Medium account disconnected.");
  }

  function exportDraft() {
    try {
      const raw = localStorage.getItem("inkwell.draft.current");
      if (!raw) {
        toast.info("No saved draft yet — generate an article first.");
        return;
      }
      const draft = JSON.parse(raw) as { markdown: string };
      downloadTextFile("medium-export.md", draft.markdown);
      toast.success("Markdown exported — paste it into Medium's story editor.");
    } catch {
      toast.error("Could not read the saved draft.");
    }
  }

  async function copyDraft() {
    try {
      const raw = localStorage.getItem("inkwell.draft.current");
      if (!raw) {
        toast.info("No saved draft yet — generate an article first.");
        return;
      }
      const draft = JSON.parse(raw) as { markdown: string };
      await navigator.clipboard.writeText(draft.markdown);
      toast.success("Markdown copied to clipboard.");
    } catch {
      toast.error("Clipboard unavailable.");
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {connection ? (
        <Card className="glass border-primary/30">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <CheckCircle2 className="size-5 text-primary" aria-hidden />
              Connected to Medium
            </CardTitle>
            <CardDescription>
              Publishing as{" "}
              <span className="font-medium text-foreground">
                {connection.username}
              </span>{" "}
              · connected {formatRelative(connection.connectedAt)} · last verified{" "}
              {formatRelative(connection.lastVerifiedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={testConnection}
              disabled={busy}
            >
              <PlugZap className="size-4" aria-hidden />
              {busy ? "Testing…" : "Test connection"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive"
              onClick={() => setConfirmDisconnect(true)}
            >
              <Unplug className="size-4" aria-hidden /> Disconnect
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Link2 className="size-5 text-primary" aria-hidden />
              Connect your Medium account
            </CardTitle>
            <CardDescription>
              Paste your Medium integration token. It is stored encrypted and only
              used to publish on your behalf.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <Label htmlFor="medium-token">Integration token</Label>
              <Input
                id="medium-token"
                type="password"
                className="mt-1.5 font-mono"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="2a1f…"
                autoComplete="off"
              />
            </div>
            <div>
              <Button onClick={connect} disabled={busy} className="gap-1.5">
                <PlugZap className="size-4" aria-hidden />
                {busy ? "Connecting…" : "Connect & test"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <Send className="size-5 text-primary" aria-hidden />
            Publishing defaults
          </CardTitle>
          <CardDescription>
            Applied when you publish a draft to Medium.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-medium">Visibility</p>
            <RadioGroup
              value={visibility}
              onValueChange={setVisibility}
              className="flex flex-wrap gap-4"
            >
              {[
                { value: "public", label: "Public" },
                { value: "unlisted", label: "Unlisted" },
                { value: "draft", label: "Medium draft" },
              ].map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value} id={`vis-${opt.value}`} />
                  <Label htmlFor={`vis-${opt.value}`} className="font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">When</p>
            <RadioGroup
              value={when}
              onValueChange={setWhen}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="now" id="when-now" />
                <Label htmlFor="when-now" className="font-normal">
                  Publish immediately
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="schedule" id="when-schedule" />
                <Label htmlFor="when-schedule" className="font-normal">
                  Schedule
                </Label>
              </div>
            </RadioGroup>
            {when === "schedule" && (
              <Input
                type="datetime-local"
                className="mt-2 w-fit"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                aria-label="Schedule date and time"
              />
            )}
          </div>
          <div>
            <Button
              className="gap-1.5"
              onClick={() =>
                toast.info(
                  connection
                    ? "Publishing goes live with the real API in Phase 7."
                    : "Connect your Medium account first."
                )
              }
            >
              <Send className="size-4" aria-hidden />
              {when === "schedule" ? "Schedule latest draft" : "Publish latest draft"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-chart-4/40">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-lg">
            <AlertTriangle className="size-5 text-chart-4" aria-hidden />
            No token? Use the export fallback
            <Badge variant="secondary" className="ml-1">
              Always works
            </Badge>
          </CardTitle>
          <CardDescription>
            Medium stopped issuing new integration tokens for most accounts. If you
            can&apos;t get one, export your article as Markdown and paste it into
            Medium&apos;s story editor — formatting carries over.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="secondary" className="gap-1.5" onClick={exportDraft}>
            <Download className="size-4" aria-hidden /> Export latest draft (.md)
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={copyDraft}>
            <ClipboardCopy className="size-4" aria-hidden /> Copy Markdown
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDisconnect}
        onOpenChange={setConfirmDisconnect}
        title="Disconnect Medium?"
        description="Publishing will be unavailable until you reconnect. Your published posts on Medium are not affected."
        confirmLabel="Disconnect"
        destructive
        onConfirm={disconnect}
      />
    </div>
  );
}
