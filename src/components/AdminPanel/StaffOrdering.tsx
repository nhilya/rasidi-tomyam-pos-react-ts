import React from "react";
import type { ApiMenuItem, ApiOrder, ApiTable } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Utensils, ArrowLeft, CheckCircle2, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../Layout/ThemeToggle";
import Receipt from "../Finance/Receipt";
import { getMenu, getCategories } from "@/api/menu";
import type { ApiCategory } from "@/api/types";
import { getTables } from "@/api/tables";
import { createOrder } from "@/api/orders";

export default function StaffOrdering() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [apiMenu, setApiMenu] = React.useState<ApiMenuItem[]>([]);
  const [tables, setTables] = React.useState<ApiTable[]>([]);
  const [menuLoading, setMenuLoading] = React.useState(true);
  const [tablesLoading, setTablesLoading] = React.useState(true);

  const [categories, setCategories] = React.useState<ApiCategory[]>([]);
  const [cart, setCart] = React.useState<{ [key: string]: number }>({});
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [step, setStep] = React.useState<"table" | "menu" | "checkout" | "success">("table");
  const [selectedTable, setSelectedTable] = React.useState<ApiTable | null>(null);
  const [lastOrder, setLastOrder] = React.useState<ApiOrder | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [placing, setPlacing] = React.useState(false);

  React.useEffect(() => {
    Promise.all([getMenu(), getCategories().catch(() => [])])
      .then(([menuRes, cats]) => { setApiMenu(menuRes.data); setCategories(cats); })
      .catch(() => toast.error("Failed to load menu"))
      .finally(() => setMenuLoading(false));
    getTables()
      .then(res => setTables(res.data))
      .catch(() => toast.error("Failed to load tables"))
      .finally(() => setTablesLoading(false));
  }, []);

  const addToCart = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = apiMenu.find((m) => m.id === Number(id));
    return sum + (item ? parseFloat(item.price) : 0) * qty;
  }, 0);

  const filteredMenu = apiMenu.filter(
    (item) =>
      (categoryId === null || item.category.id === categoryId) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      toast.error(t("pos.selectTable"));
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrder({
        table_id: selectedTable.id,
        platform: "pos",
        items: Object.entries(cart).map(([id, qty]) => ({
          menu_item_id: Number(id),
          quantity: qty,
        })),
      });
      setLastOrder(order);
      setCart({});
      setStep("success");
      toast.success(t("pos.orderPlaced"));
    } catch {
      toast.error("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (step === "table") {
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">
            {t("pos.staffOrdering")}
          </h2>
          <p className="text-muted-foreground">{t("pos.selectTable")}</p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            {tablesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {tables.map((table) => (
                  <Button
                    key={table.id}
                    variant={selectedTable?.id === table.id ? "default" : "outline"}
                    className="h-16 text-base font-bold"
                    onClick={() => setSelectedTable(table)}
                  >
                    {table.number}
                  </Button>
                ))}
              </div>
            )}
            <Button
              className="w-full h-12 text-lg font-bold mt-4"
              disabled={!selectedTable}
              onClick={() => setStep("menu")}
            >
              {t("pos.takeOrder")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/pos")}
            >
              {t("pos.backToPos")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "success" && lastOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {t("pos.orderPlaced")}
          </h2>
        </div>

        <Receipt order={lastOrder} />

        <div className="space-y-3">
          <Button
            className="w-full h-12 font-bold"
            onClick={() => {
              setCart({});
              setSelectedTable(null);
              setStep("table");
            }}
          >
            {t("pos.takeOrder")}
          </Button>
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => navigate("/pos")}
          >
            {t("pos.backToPos")}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep("menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-serif font-bold">
            {t("pos.confirmOrder")}
          </h2>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              {t("pos.orderForTable", { number: selectedTable?.number ?? '' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(cart).map(([id, qty]) => {
              const item = apiMenu.find((m) => m.id === Number(id))!;
              return (
                <div key={id} className="flex justify-between text-sm text-foreground">
                  <span>{item.name} x {qty}</span>
                  <span>RM {(parseFloat(item.price) * qty).toFixed(2)}</span>
                </div>
              );
            })}
            <div className="pt-4 border-t border-border flex justify-between font-bold text-lg text-foreground">
              <span>{t("cart.total")}</span>
              <span>RM {totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground"
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {t("pos.confirmOrder")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("table")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              {t("pos.orderForTable", { number: selectedTable?.number ?? '' })}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("inventory.search")}
          className="pl-10 h-11"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={categoryId === null ? "default" : "outline"}
          className="rounded-full h-9"
          onClick={() => setCategoryId(null)}
        >
          {t("categories.all")}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={categoryId === cat.id ? "default" : "outline"}
            className="rounded-full h-9"
            onClick={() => setCategoryId(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {menuLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 pb-24">
          {filteredMenu.map((item) => (
            <motion.div layout key={item.id}>
              <Card className="overflow-hidden border-border shadow-sm">
                <div className="flex p-3 gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center text-muted-foreground">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                      <span className="font-bold text-sm text-foreground">
                        RM {parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-end items-center gap-3 mt-1">
                      {cart[item.id] ? (
                        <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold min-w-[1rem] text-center">
                            {cart[item.id]}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => addToCart(item.id)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="rounded-full h-8 px-4"
                          onClick={() => addToCart(item.id)}
                        >
                          {t("cart.add")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <Button
              className="w-full h-14 rounded-2xl shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 flex justify-between px-6"
              onClick={() => setStep("checkout")}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground/20 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                  {totalItems}
                </div>
                <span className="font-bold">{t("cart.viewOrder")}</span>
              </div>
              <span className="font-bold">RM {totalPrice.toFixed(2)}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
