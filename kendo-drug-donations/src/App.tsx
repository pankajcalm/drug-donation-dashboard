// Drug Donation Dashboard – KendoReact with Nuclia RAG Search
// -------------------------------------------------
// Steps before running:
// 1. npm install @nuclia/core
// 2. Add to .env:
//    VITE_NUCLIA_API_KEY=your_api_key
//    VITE_NUCLIA_KB=your_knowledgebox_id
// 3. Restart dev server after adding .env

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "@progress/kendo-licensing";
//import { validateLicense } from "@progress/kendo-licensing";
// KendoReact components
import {
    AppBar,
    AppBarSection,
    AppBarSpacer,
    Drawer,
    DrawerContent,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
} from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { TextBox, NumericTextBox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
    Chart,
    ChartTitle,
    ChartSeries,
    ChartSeriesItem,
    ChartLegend,
    ChartCategoryAxis,
    ChartCategoryAxisItem,
    ChartTooltip,
} from "@progress/kendo-react-charts";
import {
    Notification,
    NotificationGroup,
} from "@progress/kendo-react-notification";
import { ListView } from "@progress/kendo-react-listview";
import "@progress/kendo-theme-default/dist/all.css";
import "hammerjs";

import nuclia from "./nucliaClient";

// -------------------- Mock Data --------------------
const CATEGORIES = ["Antibiotic", "Analgesic", "Insulin", "Antacid", "Antiviral"];
const DONORS = ["Sunshine Clinic", "GoodHealth Org", "Rx4All", "Helping Hands", "CareBridge"];

const seedInventory = [
    { id: 1, name: "Amoxicillin 500mg", category: "Antibiotic", donor: "Sunshine Clinic", qty: 120, expiry: dayjs().add(60, "day").toDate(), status: "OK" },
    { id: 2, name: "Ibuprofen 200mg", category: "Analgesic", donor: "Helping Hands", qty: 40, expiry: dayjs().add(15, "day").toDate(), status: "Low" },
    { id: 3, name: "Insulin Glargine", category: "Insulin", donor: "Rx4All", qty: 18, expiry: dayjs().add(10, "day").toDate(), status: "Low" },
    { id: 4, name: "Oseltamivir", category: "Antiviral", donor: "GoodHealth Org", qty: 85, expiry: dayjs().add(120, "day").toDate(), status: "OK" },
    { id: 5, name: "Pantoprazole", category: "Antacid", donor: "CareBridge", qty: 0, expiry: dayjs().subtract(3, "day").toDate(), status: "Expired" },
];

const seedDonations = [
    { id: 101, donor: "Sunshine Clinic", patient: "—", amount: 120, item: "Amoxicillin 500mg", when: dayjs().subtract(1, "day").toDate(), progress: 100 },
    { id: 102, donor: "Helping Hands", patient: "—", amount: 40, item: "Ibuprofen 200mg", when: dayjs().subtract(2, "day").toDate(), progress: 80 },
    { id: 103, donor: "Rx4All", patient: "—", amount: 18, item: "Insulin Glargine", when: dayjs().subtract(4, "day").toDate(), progress: 60 },
];

// -------------------- Nuclia Search --------------------
//import { Grid, GridColumn } from "@progress/kendo-react-grid";

// ...

function NucliaSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);  
    async function runSearch() {
        if (!query.trim()) return;
        try {
            setLoading(true);

            const response = await fetch(
                `https://aws-us-east-2-1.rag.progress.cloud/api/v1/kb/${import.meta.env.VITE_NUCLIA_KB}/search`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",

                    },
                    body: JSON.stringify({ query, size: 10 }),
                }
            );

            if (!response.ok) {
                throw new Error(`Nuclia error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Nuclia Search Response:", data);

            // Convert Nuclia sentences → structured inventory
            const parsed = (data.sentences?.results || []).map((r: any) =>
                parseResultText(r.text)
            );

            setResults(parsed);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    }
    //async function runSearch() {
    //    if (!query.trim()) return;
    //    try {
    //        setLoading(true);

    //        const response = await fetch("http://localhost:5000/api/search", {
    //            method: "POST",
    //            headers: { "Content-Type": "application/json" },
    //            body: JSON.stringify({ query, size: 10 }),
    //        });

    //        const data = await response.json();

    //        // Convert Nuclia sentences → structured inventory
    //        const parsed = (data.sentences?.results || []).map((r: any) =>
    //            parseResultText(r.text)
    //        );

    //        setResults(parsed);
    //    } catch (err) {
    //        console.error("Search error:", err);
    //    } finally {
    //        setLoading(false);
    //    }
    //}

    function parseResultText(text: string) {
        const lines = text.split("\n").map((l) => l.trim());
        const record: any = {};
        lines.forEach((line) => {
            const [key, ...rest] = line.split(":");
            if (key && rest.length > 0) {
                record[key.trim().toLowerCase()] = rest.join(":").trim();
            }
        });
        return {
            drug_name: record["drug_name"] || "",
            category: record["category"] || "",
            donor: record["donor"] || "",
            qty: record["quantity"] || "",
            expiry: record["expiry_date"] || "",
            status: record["status"] || "",
        };
    }

    return (
        <div style={{ padding: 16 }}>
            <h4>Smart Search (Nuclia RAG → Inventory)</h4>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <TextBox
                    placeholder="Search inventory..."
                    value={query}
                    onChange={(e) => setQuery(e.value)}
                />
                <Button themeColor="primary" onClick={runSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </Button>
            </div>

            <Grid
                data={results}
                style={{ height: "400px" }}
                pageable={true}
                sortable={true}
            >
                <GridColumn field="drug_name" title="Drug Name" />
                <GridColumn field="category" title="Category" />
                <GridColumn field="donor" title="Donor" />
                <GridColumn field="qty" title="Qty" width="80px" />
                <GridColumn
                    field="expiry"
                    title="Expiry"
                    cell={(props) => (
                        <td>
                            {props.dataItem.expiry
                                ? dayjs(props.dataItem.expiry).format("YYYY-MM-DD")
                                : ""}
                        </td>
                    )}
                />
                <GridColumn field="status" title="Status" width="120px" />
            </Grid>
        </div>
    );
}




// -------------------- Helper UI --------------------
function StatCard({ title, value }) {
    return (
        <div className="p-4">
            <Card style={{ borderRadius: 16 }}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardBody>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
                </CardBody>
            </Card>
        </div>
    );
}

// -------------------- Main App --------------------
export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [inventory, setInventory] = useState(seedInventory);
    const [notif, setNotif] = useState<any>(null);
    const [filters, setFilters] = useState({ category: null, donor: null, search: "" });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState({
        id: 0,
        name: "",
        category: CATEGORIES[0],
        donor: DONORS[0],
        qty: 0,
        expiry: new Date(),
        status: "OK",
    });

    const filteredInventory = useMemo(() => {
        return inventory.filter((r) => {
            const okCat = !filters.category || r.category === filters.category;
            const okDonor = !filters.donor || r.donor === filters.donor;
            const okSearch = !filters.search || r.name.toLowerCase().includes(filters.search.toLowerCase());
            return okCat && okDonor && okSearch;
        });
    }, [inventory, filters]);

    const categoryDist = useMemo(() => {
        const counts = CATEGORIES.map((c) =>
            inventory.filter((i) => i.category === c).reduce((s, i) => s + i.qty, 0)
        );
        return { categories: CATEGORIES, data: counts };
    }, [inventory]);

    function openNewItem() {
        setEditItem({
            id: 0,
            name: "",
            category: CATEGORIES[0],
            donor: DONORS[0],
            qty: 0,
            expiry: new Date(),
            status: "OK",
        });
        setDialogOpen(true);
    }

    function saveItem() {
        if (!editItem.name || editItem.qty < 0) {
            setNotif({ type: "error", text: "Please enter a valid name and quantity." });
            return;
        }
        if (editItem.id === 0) {
            const next = { ...editItem, id: Math.max(0, ...inventory.map((i) => i.id)) + 1 };
            setInventory([next, ...inventory]);
            setNotif({ type: "success", text: "Item added." });
        } else {
            setInventory(inventory.map((i) => (i.id === editItem.id ? editItem : i)));
            setNotif({ type: "success", text: "Item updated." });
        }
        setDialogOpen(false);
    }

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <AppBar>
                <AppBarSection>
                    <Button look="flat" icon="menu" onClick={() => setDrawerOpen(!drawerOpen)} />
                </AppBarSection>
                <AppBarSection>
                    <h3 style={{ margin: 0 }}>Drug Donation Dashboard</h3>
                </AppBarSection>
                <AppBarSpacer />
                <AppBarSection>
                    <Button themeColor="primary" onClick={openNewItem}>Add Donation</Button>
                </AppBarSection>
            </AppBar>

            <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
                <Drawer expanded={drawerOpen} mode="push" width={300} position="start">
                    <div style={{ padding: 16 }}>
                        <h4>Filters</h4>
                        <div className="k-form-field">
                            <label>Category</label>
                            <DropDownList
                                data={CATEGORIES}
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.value })}
                            />
                        </div>
                        <div className="k-form-field" style={{ marginTop: 12 }}>
                            <label>Donor</label>
                            <DropDownList
                                data={DONORS}
                                value={filters.donor}
                                onChange={(e) => setFilters({ ...filters, donor: e.value })}
                            />
                        </div>
                        <div className="k-form-field" style={{ marginTop: 12 }}>
                            <label>Search</label>
                            <TextBox
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.value })}
                                placeholder="Drug name..."
                            />
                        </div>
                    </div>
                </Drawer>

                <DrawerContent>
                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: 12 }}>
                        <StatCard title="Total Donors" value={DONORS.length} />
                        <StatCard title="Total Items" value={inventory.length} />
                        <StatCard title="Active Categories" value={CATEGORIES.length} />
                    </div>

                    {/* Inventory Grid & Chart */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, padding: 12 }}>
                        <div>
                            <h4>Inventory</h4>
                            <Grid data={filteredInventory} style={{ height: 380 }}>
                                <GridColumn field="name" title="Drug Name" />
                                <GridColumn field="category" title="Category" />
                                <GridColumn field="donor" title="Donor" />
                                <GridColumn field="qty" title="Qty" />
                                <GridColumn
                                    field="expiry"
                                    title="Expiry"
                                    cell={(props) => <td>{dayjs(props.dataItem.expiry).format("YYYY-MM-DD")}</td>}
                                />
                                <GridColumn field="status" title="Status" />
                            </Grid>
                        </div>
                        <div>
                            <Card style={{ borderRadius: 16 }}>
                                <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
                                <CardBody>
                                    <Chart style={{ height: 380 }}>
                                        <ChartTitle text="Quantity by Category" />
                                        <ChartLegend position="bottom" />
                                        <ChartCategoryAxis>
                                            <ChartCategoryAxisItem categories={categoryDist.categories} />
                                        </ChartCategoryAxis>
                                        <ChartSeries>
                                            <ChartSeriesItem type="column" data={categoryDist.data} />
                                        </ChartSeries>
                                        <ChartTooltip />
                                    </Chart>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    {/* Nuclia Search */}
                    <div style={{ padding: 12 }}>
                        <NucliaSearch />
                    </div>
                </DrawerContent>
            </div>

            {/* Notifications */}
            <NotificationGroup style={{ right: 24, bottom: 24, position: "fixed" }}>
                {notif && (
                    <Notification
                        type={{ style: notif.type, icon: true }}
                        closable
                        onClose={() => setNotif(null)}
                    >
                        {notif.text}
                    </Notification>
                )}
            </NotificationGroup>

            {dialogOpen && (
                <Dialog onClose={() => setDialogOpen(false)} title="Add Item">
                    <div
                        className="k-form"
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 8 }}
                    >
                        <span style={{ gridColumn: "span 2" }}>
                            <label className="k-label">Drug Name</label>
                            <TextBox
                                value={editItem.name}
                                onChange={(e) => setEditItem({ ...editItem, name: e.value })}
                            />
                        </span>
                        <span>
                            <label className="k-label">Category</label>
                            <DropDownList
                                data={CATEGORIES}
                                value={editItem.category}
                                onChange={(e) => setEditItem({ ...editItem, category: e.value })}
                            />
                        </span>
                        <span>
                            <label className="k-label">Donor</label>
                            <DropDownList
                                data={DONORS}
                                value={editItem.donor}
                                onChange={(e) => setEditItem({ ...editItem, donor: e.value })}
                            />
                        </span>
                        <span>
                            <label className="k-label">Quantity</label>
                            <NumericTextBox
                                value={editItem.qty}
                                onChange={(e) => setEditItem({ ...editItem, qty: e.value ?? 0 })}
                                min={0}
                            />
                        </span>
                        <span>
                            <label className="k-label">Expiry</label>
                            <DatePicker
                                value={editItem.expiry}
                                onChange={(e) => setEditItem({ ...editItem, expiry: e.value ?? new Date() })}
                            />
                        </span>
                    </div>
                    <DialogActionsBar>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button themeColor="primary" onClick={saveItem}>Save</Button>
                    </DialogActionsBar>
                </Dialog>
            )}
        </div>
    );
}
