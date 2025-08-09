"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as React from "react";
import clsx from "clsx";

export type FAQItem = {
    id: string;
    question: string;
    /** Rendered in the UI */
    answer: React.ReactNode;
    /**
     * Plain-text version of the answer (optional, for SEO JSON-LD).
     * If omitted and `answer` is a string, we’ll use that.
     */
    answerPlain?: string;
};

type FAQProps = {
    items: FAQItem[];
    title?: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
    /** Adds schema.org FAQPage JSON-LD when true */
    richResults?: boolean;
    /** shadcn Accordion props */
    accordionType?: "single" | "multiple";
    collapsible?: boolean;
};

export function FAQ(props: FAQProps) {

    const {
        items,
        title = "❓ FAQ",
        description = "Common questions and answers",
        className,
        richResults = false,
        accordionType = "single",
        collapsible = true,
    } = props;

    // Build JSON-LD only if requested
    const faqJsonLd = React.useMemo(() => {
        if (!richResults) return null;

        const mainEntity = items.map((it) => {
            const text =
                typeof it.answer === "string"
                    ? it.answer
                    : (it.answerPlain ?? undefined);

            return {
                "@type": "Question",
                name: it.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    // If no plain text available for a rich result, omit `text`
                    ...(text ? { text } : {}),
                },
            };
        });

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity,
        };
    }, [items, richResults]);

    return (
        <section className={clsx("w-full max-w-4xl mx-auto my-10", className)} aria-labelledby="faq-heading">
            {(title || description) && (
                <div className="text-center mb-8">
                    {title && (
                        <h2 id="faq-heading" className="text-2xl font-bold text-foreground mb-2">
                            {title}
                        </h2>
                    )}
                    {description && <p className="text-muted-foreground">{description}</p>}
                </div>
            )}

            <Accordion type={accordionType} collapsible={collapsible} className="w-full space-y-2">
                {items.map(({ id, question, answer }) => (
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

            {richResults && faqJsonLd && (
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}
        </section>
    );
}
