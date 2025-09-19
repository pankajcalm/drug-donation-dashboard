# Drug Donation Dashboard – KendoReact + Nuclia RAG

This project is my submission for the [KendoReact Free Components Challenge](https://www.telerik.com/kendo-react-ui/components/challenges/).

It demonstrates how **KendoReact components**, the **KendoReact AI Coding Assistant**, and **Nuclia RAG search** can be combined to build a smart, production-ready dashboard.

---

## 🚀 Features
- **Inventory Management** – track donated medicines with category, donor, quantity, expiry, and status  
- **Nuclia RAG Search** – query donations in natural language and see structured results in a grid  
- **Status Highlights** – expired or low-stock items are automatically highlighted  
- **Interactive UI** – filter by category/donor, add/edit donations, and see category distributions  

---

## 🧩 KendoReact Components Used
- AppBar  
- Drawer  
- Grid  
- Card  
- Chart  
- Dialog  
- Inputs (TextBox, NumericTextBox, DropDownList, DatePicker)  
- Notification  

---

## 🤖 AI Coding Assistant
The **KendoReact AI Coding Assistant** was used to:
- Scaffold initial grid & drawer layouts  
- Generate GridColumn definitions quickly  
- Suggest styling & boilerplate for forms/dialogs  
- Accelerate development by reducing repetitive setup code  

---

## 📚 Nuclia RAG Integration
- Connected to a **public KnowledgeBox** with sample donation data  
- Queries like *“Insulin donations”* return structured results  
- Results parsed into `{ drug_name, category, donor, qty, expiry, status }` and rendered inside the **KendoReact Grid**  

---

## 🖼️ Screenshots
(Add your screenshots or gifs here)

---

## 🛠️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/drug-donation-dashboard.git
cd drug-donation-dashboard
