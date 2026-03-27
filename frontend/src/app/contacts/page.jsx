import ContactForm from "./ContactForm";

const contactMethods = [
  {
    title: "Email",
    value: "hello@financialfreedom.com",
    description: "Best for general questions, support, and partnership ideas.",
  },
  {
    title: "Hotline",
    value: "+94 77 123 4567",
    description: "Best for general questions, support, and partnership ideas.",
  },
  {
    title: "Location",
    value: "Colombo, Sri Lanka",
    description: "Our team works remotely and responds during business hours.",
  },
  {
    title: "Availability",
    value: "Mon - Fri, 9:00 AM - 5:00 PM",
    description: "Messages sent after hours will be answered on the next workday.",
  },
];

export const metadata = {
  title: "Contact Us",
  description: "Send feedback or get in touch with The Financial Freedom team.",
};

export default function ContactsPage() {
  return (
    <main className="relative w-full space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-emerald-100 via-cyan-50 to-sky-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -left-14 top-10 h-52 w-52 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute -right-14 bottom-0 h-56 w-56 rounded-full bg-sky-300/30 blur-3xl" />

        <div className="relative max-w-3xl space-y-5">
          <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Contact Us
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Share your feedback or send us a quick message.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
            This page is intentionally simple: if you have feedback, a question,
            or a suggestion, fill out the form below and our team will get back
            to you as soon as possible.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Get In Touch
          </p>
          <div className="mt-5 space-y-4">
            {contactMethods.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-500">
                  {item.title}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Feedback Form
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Send us your message
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 md:text-base">
              Fill in your details and tell us what is on your mind.
            </p>
          </div>

          <ContactForm />
        </section>
      </section>
    </main>
  );
}
