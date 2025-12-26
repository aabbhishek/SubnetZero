<div align="center">

<img src="./public/subnet-zero.png" alt="Subnet Zero Logo" width="120" height="120" />

# Subnet Zero

**Cloud-Native Subnet Calculator for Network Engineers & DevOps Teams**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Live Demo](https://aabbhishek.github.io/SubnetZero) · [Report Bug](https://github.com/aabbhishek/SubnetZero/issues) · [Request Feature](https://github.com/aabbhishek/SubnetZero/issues)

</div>

---

## 🚀 Features

### Cloud-Native Subnet Calculator
- **AWS/Azure/GCP Reserved IP Awareness** - Know exactly how many IPs you can use
- **Real Cloud Numbers** - AWS reserves 5 IPs, Azure reserves 5, GCP reserves 4
- **IPv4 & IPv6 Support** - Full parity across both protocols

### VPC/VNet Planner
- **Visual Subnet Hierarchy** - See your VPC layout as a tree or block diagram
- **Multi-AZ Planning** - Plan subnets across availability zones
- **Overlap Detection** - Catch CIDR conflicts before they cause problems
- **Quick Patterns** - One-click 3-tier, 2-AZ architecture templates

### Infrastructure as Code Export
- **Terraform** - AWS, Azure, GCP provider support
- **CloudFormation** - YAML and JSON formats
- **Pulumi** - TypeScript templates
- **Copy & Download** - Get your code instantly

### Shareable URLs
- **Encode Full State** - Share exact calculations with colleagues
- **Zero Backend** - State lives in the URL, no server needed

### Privacy First
- **100% Client-Side** - All calculations happen in your browser
- **No Data Transmission** - Nothing leaves your machine
- **No Tracking** - Your network configs stay private

---

## 🖥️ Screenshots

<details>
<summary>Click to view screenshots</summary>

### Subnet Calculator
![Subnet Calculator](./docs/screenshots/calculator.png)

### VPC Planner
![VPC Planner](./docs/screenshots/vpc-planner.png)

### IaC Export
![IaC Export](./docs/screenshots/iac-export.png)

</details>

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/aabbhishek/SubnetZero.git
cd SubnetZero

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 🚀 Deployment

### GitHub Pages

1. Update `homepage` in `package.json`:
   ```json
   "homepage": "https://aabbhishek.github.io/SubnetZero"
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

### Other Platforms

Build the static files:
```bash
npm run build
```

The `build` folder contains the production-ready static files. Deploy to any static hosting:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps

---

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Framer Motion** - Animations
- **Pure JavaScript** - IP calculations (no external libs)
- **CSS Variables** - Theming system
- **lz-string** - URL state compression

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── GlassCard.jsx
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── ...
│   ├── layout/           # App shell
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Background.jsx
│   └── modules/
│       ├── SubnetCalculator/
│       └── VPCPlanner/
├── utils/
│   ├── ipv4.js           # IPv4 calculation utilities
│   ├── ipv6.js           # IPv6 calculation utilities
│   ├── cloudProviders.js # Cloud provider configs
│   ├── iacGenerators/    # Terraform, CF, Pulumi generators
│   └── urlState.js       # Shareable URL encoding
├── styles/
│   ├── variables.css     # Design tokens
│   ├── glassmorphism.css # Glass effects
│   └── animations.css    # Keyframes
└── App.jsx
```

---

## 🧮 Cloud Provider Reserved IPs

| Provider | Reserved | Details |
|----------|----------|---------|
| **AWS** | 5 per subnet | Network, VPC Router, DNS, Future, Broadcast |
| **Azure** | 5 per subnet | Network, Gateway, 2× DNS, Broadcast |
| **GCP** | 4 per subnet | Network, Gateway, 2nd-to-last, Broadcast |
| **Traditional** | 2 per subnet | Network, Broadcast |

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for network engineers who are tired of manually adjusting for cloud reserved IPs
- Inspired by the pain of VPC planning in spreadsheets
- Designed for the DevOps and SRE community

---

<div align="center">

**[⬆ Back to Top](#subnet-zero)**

Made with ❤️ for the DevOps community

</div>
