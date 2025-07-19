import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link";

export function ExtractTextFAQ() {
    return (
        <div className="w-full max-w-4xl mx-auto my-10">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">❓ FAQ</h2>
                <p className="text-muted-foreground">Common questions about PDF text extraction</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem value="item-1" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium">What is PDF Toolkit: Extract Text Page?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                        It's a simple tool that lets you extract raw, selectable text from PDF files directly in your browser.
                        Useful for copying, analyzing, or converting text from documents like annual reports, terms of service, or
                        research papers.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium">What files are accepted?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                        Only PDF files (.pdf) are supported.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium">Can I upload more than one PDF at once?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                        No, this page supports only single file uploads. However, you can use our <Link className="underline font-extrabold text-primary" href={"merge-pdf"}>Merge PDF Tool</Link> to combine multiple
                        PDFs into one, and then upload the merged file here for text extraction.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium">Is OCR supported for scanned PDFs?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                        Currently, OCR is not supported. If your file is an image-based or scanned PDF, no text will be extracted.
                        You can use external OCR tools first, then re-upload the converted PDF.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium">Is the file uploaded to a server?</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                        No. All processing occurs entirely within your browser, keeping your files private and secure.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
