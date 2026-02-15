import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqData } from "@/data/faq"

export const FAQSection = () => {
    return (
        <section id="faq" className="py-20 bg-surface/50 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 text-center sm:mb-14">
                        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Frequently asked questions</h2>
                        <p className="text-base text-muted-foreground sm:text-lg">
                            Quick answers about privacy, processing, and supported PDF actions.
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                        {faqData.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="rounded-xl border border-border/80 bg-card px-6"
                            >
                                <AccordionTrigger className="text-left transition-colors hover:text-primary">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    )
}
