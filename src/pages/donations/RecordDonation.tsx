import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  DollarSign,
  User,
  CreditCard,
  FileText,
  Save,
  Plus,
  Search,
  X,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock members for donor selection
const mockMembers = [
  { id: 1, name: "Michael Johnson", email: "michael.johnson@email.com", phone: "(555) 123-4567" },
  { id: 2, name: "Sarah Williams", email: "sarah.williams@email.com", phone: "(555) 234-5678" },
  { id: 3, name: "David Thompson", email: "david.thompson@email.com", phone: "(555) 345-6789" },
  { id: 4, name: "Jennifer Davis", email: "jennifer.davis@email.com", phone: "(555) 456-7890" },
  { id: 5, name: "Robert Brown", email: "robert.brown@email.com", phone: "(555) 567-8901" },
  { id: 6, name: "Emily Martinez", email: "emily.martinez@email.com", phone: "(555) 678-9012" },
  { id: 7, name: "James Wilson", email: "james.wilson@email.com", phone: "(555) 789-0123" },
  { id: 8, name: "Lisa Anderson", email: "lisa.anderson@email.com", phone: "(555) 890-1234" },
];

const donationCategories = [
  { value: "tithes", label: "Tithes" },
  { value: "general-offering", label: "General Offering" },
  { value: "building-fund", label: "Building Fund" },
  { value: "missions", label: "Missions" },
  { value: "youth-ministry", label: "Youth Ministry" },
  { value: "benevolence", label: "Benevolence" },
  { value: "special-projects", label: "Special Projects" },
  { value: "other", label: "Other" },
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "online", label: "Online/Card" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "stock", label: "Stock/Securities" },
  { value: "other", label: "Other" },
];

interface DonationItem {
  id: string;
  category: string;
  amount: string;
  notes: string;
}

export default function RecordDonation() {
  const [, navigate] = useLocation();

  // Donor selection
  const [donorType, setDonorType] = useState<"member" | "guest" | "anonymous">("member");
  const [selectedDonor, setSelectedDonor] = useState<typeof mockMembers[0] | null>(null);
  const [donorSearch, setDonorSearch] = useState("");
  const [showDonorSearch, setShowDonorSearch] = useState(false);

  // Guest donor info
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");

  // Donation details
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Multiple donation items
  const [donationItems, setDonationItems] = useState<DonationItem[]>([
    { id: "1", category: "", amount: "", notes: "" },
  ]);

  // Additional options
  const [sendReceipt, setSendReceipt] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Filter members based on search
  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
      member.email.toLowerCase().includes(donorSearch.toLowerCase())
  );

  const addDonationItem = () => {
    setDonationItems([
      ...donationItems,
      { id: Date.now().toString(), category: "", amount: "", notes: "" },
    ]);
  };

  const removeDonationItem = (id: string) => {
    if (donationItems.length > 1) {
      setDonationItems(donationItems.filter((item) => item.id !== id));
    }
  };

  const updateDonationItem = (id: string, field: keyof DonationItem, value: string) => {
    setDonationItems(
      donationItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const totalAmount = donationItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setShowSuccessDialog(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate("/donations/list");
  };

  const canSubmit = () => {
    // Check donor info
    if (donorType === "member" && !selectedDonor) return false;
    if (donorType === "guest" && !guestName) return false;

    // Check donation items
    if (donationItems.every((item) => !item.category || !item.amount)) return false;

    // Check payment method
    if (!paymentMethod) return false;

    return true;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/donations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Record Donation</h1>
          <p className="text-muted-foreground mt-1">
            Enter a new donation manually
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Donor Information
                </CardTitle>
                <CardDescription>
                  Select or enter donor details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Donor Type Selection */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={donorType === "member" ? "default" : "outline"}
                    onClick={() => {
                      setDonorType("member");
                      setSelectedDonor(null);
                    }}
                    className="flex-1"
                  >
                    Church Member
                  </Button>
                  <Button
                    type="button"
                    variant={donorType === "guest" ? "default" : "outline"}
                    onClick={() => {
                      setDonorType("guest");
                      setSelectedDonor(null);
                    }}
                    className="flex-1"
                  >
                    Guest
                  </Button>
                  <Button
                    type="button"
                    variant={donorType === "anonymous" ? "default" : "outline"}
                    onClick={() => {
                      setDonorType("anonymous");
                      setSelectedDonor(null);
                    }}
                    className="flex-1"
                  >
                    Anonymous
                  </Button>
                </div>

                {/* Member Selection */}
                {donorType === "member" && (
                  <div className="space-y-3">
                    <Label>Select Member</Label>
                    {selectedDonor ? (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{selectedDonor.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedDonor.email}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedDonor(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search members by name or email..."
                          value={donorSearch}
                          onChange={(e) => setDonorSearch(e.target.value)}
                          onFocus={() => setShowDonorSearch(true)}
                          className="pl-10"
                        />
                        {showDonorSearch && donorSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
                            {filteredMembers.length === 0 ? (
                              <div className="p-3 text-center text-muted-foreground">
                                No members found
                              </div>
                            ) : (
                              filteredMembers.map((member) => (
                                <button
                                  key={member.id}
                                  type="button"
                                  className="w-full p-3 text-left hover:bg-muted flex items-center justify-between"
                                  onClick={() => {
                                    setSelectedDonor(member);
                                    setDonorSearch("");
                                    setShowDonorSearch(false);
                                  }}
                                >
                                  <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Guest Information */}
                {donorType === "guest" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Full Name *</Label>
                      <Input
                        id="guestName"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail">Email</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestPhone">Phone</Label>
                      <Input
                        id="guestPhone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestAddress">Address</Label>
                      <Input
                        id="guestAddress"
                        value={guestAddress}
                        onChange={(e) => setGuestAddress(e.target.value)}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                )}

                {/* Anonymous Notice */}
                {donorType === "anonymous" && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      This donation will be recorded without donor information. No receipt will be sent.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Donation Details
                </CardTitle>
                <CardDescription>
                  Enter donation amounts by category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {donationItems.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      {donationItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDonationItem(item.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateDonationItem(item.id, "category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {donationCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.amount}
                            onChange={(e) => updateDonationItem(item.id, "amount", e.target.value)}
                            placeholder="0.00"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={item.notes}
                        onChange={(e) => updateDonationItem(item.id, "notes", e.target.value)}
                        placeholder="Add notes for this donation item"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addDonationItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Category
                </Button>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  How was this donation received?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donationDate">Date *</Label>
                    <Input
                      id="donationDate"
                      type="date"
                      value={donationDate}
                      onChange={(e) => setDonationDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentMethod === "check" && (
                  <div className="space-y-2">
                    <Label htmlFor="checkNumber">Check Number</Label>
                    <Input
                      id="checkNumber"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                      placeholder="Enter check number"
                    />
                  </div>
                )}

                {(paymentMethod === "online" || paymentMethod === "bank-transfer") && (
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {donorType !== "anonymous" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Send Receipt</Label>
                      <p className="text-sm text-muted-foreground">
                        Email a donation receipt to the donor
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={sendReceipt ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSendReceipt(!sendReceipt)}
                    >
                      {sendReceipt ? "Yes" : "No"}
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recurring Donation</Label>
                    <p className="text-sm text-muted-foreground">
                      Mark this as a recurring gift
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={isRecurring ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsRecurring(!isRecurring)}
                  >
                    {isRecurring ? "Yes" : "No"}
                  </Button>
                </div>

                {isRecurring && (
                  <div className="space-y-2 pl-4 border-l-2">
                    <Label>Frequency</Label>
                    <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="generalNotes">General Notes</Label>
                  <textarea
                    id="generalNotes"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Add any additional notes about this donation..."
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Donation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Donor */}
                <div>
                  <Label className="text-muted-foreground">Donor</Label>
                  <p className="font-medium">
                    {donorType === "member"
                      ? selectedDonor?.name || "Not selected"
                      : donorType === "guest"
                      ? guestName || "Not entered"
                      : "Anonymous"}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {donationDate
                      ? new Date(donationDate).toLocaleDateString()
                      : "Not selected"}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium">
                    {paymentMethods.find((m) => m.value === paymentMethod)?.label ||
                      "Not selected"}
                  </p>
                </div>

                {/* Items Breakdown */}
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">Breakdown</Label>
                  <div className="mt-2 space-y-2">
                    {donationItems.map((item, index) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {donationCategories.find((c) => c.value === item.category)?.label ||
                            `Item ${index + 1}`}
                        </span>
                        <span>${parseFloat(item.amount || "0").toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {sendReceipt && donorType !== "anonymous" && (
                    <Badge variant="secondary">Receipt will be sent</Badge>
                  )}
                  {isRecurring && (
                    <Badge variant="secondary">
                      Recurring ({recurringFrequency || "..."})
                    </Badge>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full mt-4"
                  size="lg"
                  disabled={!canSubmit() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Record Donation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Donation Recorded!</DialogTitle>
            <DialogDescription className="text-center">
              The donation of ${totalAmount.toFixed(2)} has been successfully recorded.
              {sendReceipt && donorType !== "anonymous" && (
                <span className="block mt-2">A receipt will be sent to the donor.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSuccessClose} className="flex-1">
              View All Donations
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                // Reset form
                setSelectedDonor(null);
                setGuestName("");
                setGuestEmail("");
                setGuestPhone("");
                setGuestAddress("");
                setDonationItems([{ id: "1", category: "", amount: "", notes: "" }]);
                setPaymentMethod("");
                setCheckNumber("");
                setTransactionId("");
                setGeneralNotes("");
              }}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
