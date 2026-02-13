import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="mb-4 text-4xl font-bold">About The Financial Freedom</h1>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div>
          <span className="text-slate-300 text-lg">
            The Financial Freedom is a blog dedicated to providing valuable insights, tips, and resources to help individuals achieve financial independence and live a life of freedom. Our mission is to empower our readers with the knowledge and tools they need to take control of their finances, make informed decisions, and create a secure financial future. Whether you&apos;re looking for advice on budgeting, investing, or building multiple streams of income, The Financial Freedom has you covered. Join us on this journey towards financial freedom and start taking steps towards a brighter financial future today!
          </span>
        </div>
        <div>
          <Image
            src="/f5.png"
            alt="Financial Freedom Logo"
            width={4200}
            height={3000}
            className="h-auto w-400px rounded-md"
            priority
          />
        </div>
      </div>
    </div>
  );
}