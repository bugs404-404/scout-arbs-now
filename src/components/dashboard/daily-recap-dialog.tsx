import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DailyRecapTicket } from "./daily-recap-ticket";
import { dailyPerformance } from "@/lib/mock-data";
import { toast } from "sonner";

interface Props {
  trigger?: React.ReactNode;
}

export function DailyRecapDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  // Hidden export-sized ticket (rendered offscreen) for high-res PNG
  const exportRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });
      const link = document.createElement("a");
      link.download = `arbscout-recap-${dailyPerformance.date}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Ticket downloaded");
    } catch {
      toast.error("Could not generate image");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Download ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your daily P&L ticket</DialogTitle>
          <DialogDescription>
            Share or save a beautifully designed snapshot of today's performance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <DailyRecapTicket />
        </div>

        {/* Offscreen high-res render for export */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: -99999,
            pointerEvents: "none",
            opacity: 0,
          }}
        >
          <DailyRecapTicket ref={exportRef} exportMode />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="sm:mr-auto"
          >
            Close
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
