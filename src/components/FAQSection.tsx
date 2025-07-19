import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { faqData } from "@/data/faq"

export const FAQSection = () => {
    return (
        <section id="faq" className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                        <p className="text-lg text-muted-foreground">Find answers to common questions about our PDF tools</p>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                        {faqData.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="bg-background border border-primary/20 rounded-lg px-6"
                            >
                                <AccordionTrigger className="text-left hover:text-primary transition-colors">
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
