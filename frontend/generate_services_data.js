import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = {
  "Digital Finance": [
    "Digital Finance Platform", "Digital Gold Investment", "Digital Payments",
    "Payment & Transactions", "Financial Analytics", "Financial Automation"
  ],
  "Lending & Credit": [
    "Loan Management", "Personal Loan Management", "Business Loan Management",
    "Loan Application & Approval", "Repayment Management", "Credit Management"
  ],
  "Investment & Wealth": [
    "Investment Management", "Wealth Management", "Startup Investment",
    "Portfolio Management", "Investment Analytics", "Investor Management"
  ],
  "Business Finance": [
    "Business Finance Management", "Working Capital Management", "Cash Flow Management",
    "Financial Planning", "Budget Management"
  ],
  "Risk & Compliance": [
    "Risk Management", "Financial Monitoring", "Audit & Compliance", "Fraud & Risk Monitoring"
  ]
};

const slugify = (text) => text.toLowerCase().replace(/ & /g, '-').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const allSlugs = [];
Object.values(categories).forEach(services => {
  services.forEach(s => allSlugs.push(slugify(s)));
});

const servicesData = [];

for (const [category, services] of Object.entries(categories)) {
  for (const title of services) {
    const slug = slugify(title);
    
    // Pick 4 random related services that are not the current one
    const related = [...allSlugs].filter(s => s !== slug).sort(() => 0.5 - Math.random()).slice(0, 4);

    const service = {
      slug,
      category,
      title,
      heroTitle: `Next-Generation ${title} Solutions`,
      heroDescription: `Empower your financial future with our comprehensive ${title.toLowerCase()} platform, designed for modern scalability and uncompromising security.`,
      heroImage: "/finance_hero_bg_1786467171882.jpg", // default hero bg
      seo: {
        title: `${title} | Kalpanaa Finance`,
        description: `Discover how Kalpanaa Finance transforms ${title.toLowerCase()} with innovative, secure, and scalable financial solutions.`
      },
      introduction: {
        eyebrow: category.toUpperCase(),
        title: `Transform Your ${title.split(' ')[0]} Workflows`,
        description: `Our ${title} services provide end-to-end visibility and control. Whether you're a scaling startup or an established enterprise, Kalpanaa Finance ensures your financial operations run smoothly, securely, and efficiently.`
      },
      features: [
        { title: "Real-time Dashboard", description: "Monitor all metrics in real-time.", icon: "Activity" },
        { title: "Automated Workflows", description: "Reduce manual intervention.", icon: "Cpu" },
        { title: "Secure Transactions", description: "Bank-grade encryption.", icon: "Shield" },
        { title: "Custom Reporting", description: "Exportable analytics data.", icon: "FileText" }
      ],
      benefits: [
        "Increased Operational Efficiency",
        "Reduced Compliance Risk",
        "Enhanced Data Visibility",
        "Scalable Infrastructure"
      ],
      useCases: [
        "Enterprise Resource Planning",
        "Cross-border Transactions",
        "Retail Customer Management"
      ],
      process: [
        { step: 1, title: "Discovery", description: "We analyze your current financial setup." },
        { step: 2, title: "Integration", description: "Seamless API connection to your existing tools." },
        { step: 3, title: "Optimization", description: "Continuous monitoring and performance tuning." }
      ],
      capabilities: [
        "API Integration", "Role-based Access Control", "24/7 Monitoring", "Global Currency Support"
      ],
      faq: [
        { question: `How secure is your ${title}?`, answer: "We use military-grade encryption and conduct regular third-party security audits." },
        { question: "How long does implementation take?", answer: "Most clients are fully integrated within 2-4 weeks depending on system complexity." }
      ],
      relatedServices: related,
      cta: {
        title: `Ready to upgrade your ${title.toLowerCase()}?`,
        description: "Join hundreds of forward-thinking businesses using Kalpanaa Finance.",
        primary: "Talk to Our Experts",
        secondary: "Explore Other Services"
      }
    };
    servicesData.push(service);
  }
}

const dir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const fileContent = `// Auto-generated comprehensive services ecosystem data\n\nexport const servicesData = ${JSON.stringify(servicesData, null, 2)};\n`;

fs.writeFileSync(path.join(dir, 'servicesData.js'), fileContent);
console.log('Successfully generated servicesData.js with ' + servicesData.length + ' services.');
