import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";

interface AttendanceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string;
  lectureTitle: string;
}

const AttendanceListDialog = ({ open, onOpenChange, lectureId, lectureTitle }: AttendanceListDialogProps) => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAttendance();
    }
  }, [open, lectureId]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          profiles:student_id (
            full_name,
            student_id,
            email,
            department
          )
        `)
        .eq("lecture_id", lectureId)
        .order("marked_at", { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance List</DialogTitle>
          <DialogDescription>{lectureTitle}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students have marked attendance yet
            </div>
          ) : (
            <div className="space-y-2">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(record.profiles.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{record.profiles.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.profiles.student_id} • {record.profiles.department}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-secondary">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Present</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(record.marked_at), "HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground text-center">
            Total: <span className="font-medium text-foreground">{attendance.length}</span> students
            present
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceListDialog;
