import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link";

type FaqItem = {
    id: string;
    question: string;
    answer: React.ReactNode;
};

const FAQS: FaqItem[] = [
    {
        id: "what-is",
        question: "What is PDF Toolkit: Extract Text Page?",
        answer: (
            <>
                It’s a simple tool that extracts raw, selectable text from PDF files directly in your browser. Useful for copying,
                analyzing, or converting text from documents like annual reports, terms of service, or research papers.
            </>
        ),
    },
    {
        id: "accepted",
        question: "What files are accepted?",
        answer: <>Only PDF files (.pdf) are supported.</>,
    },
    {
        id: "multiple",
        question: "Can I upload more than one PDF at once?",
        answer: (
            <>
                No, this page supports only single file uploads. However, you can use our{" "}
                <Link className="underline font-extrabold text-primary" href="/merge-pdf">
                    Merge PDF Tool
                </Link>{" "}
                to combine multiple PDFs into one, then upload the merged file here for text extraction.
            </>
        ),
    },
    {
        id: "ocr",
        question: "Is OCR supported for scanned PDFs?",
        answer: (
            <>
                Currently, OCR is not supported. If your file is image‑based or scanned, no text will be extracted. Use an external
                OCR tool first, then re‑upload the converted PDF.
            </>
        ),
    },
    {
        id: "privacy",
        question: "Is the file uploaded to a server?",
        answer: (
            <>
                No. All processing happens in your browser, keeping your files private and secure.
            </>
        ),
    },
];

export function ExtractTextFAQ() {
    // JSON-LD for FAQ rich results
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQS.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": typeof f.answer === "string" ? f.answer : undefined,
            },
        })),
    };

    return (
        <section className="w-full max-w-4xl mx-auto my-10" aria-labelledby="extract-faq-heading">
            <div className="text-center mb-8">
                <h2 id="extract-faq-heading" className="text-2xl font-bold text-foreground mb-2">
                    ❓ FAQ
                </h2>
                <p className="text-muted-foreground">Common questions about PDF text extraction</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
                {FAQS.map(({ id, question, answer }) => (
                    <AccordionItem
                        key={id}
                        value={id}
                        className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
                    >
                        <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-medium">{question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                            {answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {/* SEO: FAQ rich snippets (safe to include in client components) */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        </section>
    );
}
