import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Download} from "lucide-react";


interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    confirmDownload: () => void;
    filename?: string;
    defaultName?: string;
    setFilename: (name: string) => void;
}


export const DialogDownloadSplitPdf = (props: Props) => {

    const { open, setOpen, confirmDownload, filename, defaultName, setFilename } = props;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button onClick={()=> setOpen(true)} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rename file</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <Label htmlFor="filename">File name</Label>
                    <Input
                        id="filename"
                        value={filename || defaultName}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder={defaultName}
                    />
                    <p className="text-xs text-muted-foreground">.pdf will be appended automatically</p>
                    <div className="flex gap-2 pt-2">
                        <Button className="flex-1" onClick={confirmDownload}>
                            Download
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    )
}