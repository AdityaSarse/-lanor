import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, MapPin, Package, Shield, Plus, Trash2, Check, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { addressService } from "../../services/api.service";
import { toast } from "sonner";

export const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // profile | addresses
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    type: "Home",
  });
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [submittingAddr, setSubmittingAddr] = useState(false);

  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await addressService.getAll();
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setAddresses(list);
    } catch (err) {
      console.warn("Failed to load addresses", err);
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName.trim() || !newAddr.phone.trim() || !newAddr.addressLine1.trim()) {
      return toast.error("Please fill in required fields.");
    }
    setSubmittingAddr(true);
    try {
      await addressService.create(newAddr);
      toast.success("Address added successfully!");
      setShowAddAddr(false);
      setNewAddr({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        type: "Home",
      });
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address.");
    } finally {
      setSubmittingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this saved address?")) return;
    try {
      await addressService.delete(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast.success("Address deleted.");
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefault(id);
      fetchAddresses();
      toast.success("Default address updated.");
    } catch (err) {
      toast.error("Failed to update default address.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1400px] px-6 py-2.5 lg:px-10">
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">My Account</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 text-center">
        <h1 className="text-[24px] font-bold tracking-[0.08em] text-gray-900 uppercase">
          My Account
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Welcome back, <span className="font-semibold text-gray-800">{user?.firstName || "Member"}</span>
        </p>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="bg-white border border-gray-200 p-4 rounded-sm space-y-1 h-fit">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                activeTab === "profile" ? "bg-[#0d2137] text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4" /> Personal Profile
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                activeTab === "addresses" ? "bg-[#0d2137] text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MapPin className="h-4 w-4" /> Saved Addresses
            </button>
            <Link
              to="/orders"
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-sm transition-colors"
            >
              <span className="flex items-center gap-3"><Package className="h-4 w-4" /> Order History</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              to="/wishlist"
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-sm transition-colors"
            >
              <span className="flex items-center gap-3"><Shield className="h-4 w-4" /> Wishlist</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white border border-gray-200 p-6 rounded-sm space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-3">
                  Account Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">First Name</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-800 font-medium">
                      {user?.firstName || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Last Name</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-800 font-medium">
                      {user?.lastName || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Email Address</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-800 font-medium">
                      {user?.email || "—"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Account Role</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm text-gray-800 font-medium capitalize">
                      {user?.role || "Customer"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white border border-gray-200 p-6 rounded-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Saved Addresses ({addresses.length})
                  </h3>
                  <button
                    onClick={() => setShowAddAddr(!showAddAddr)}
                    className="inline-flex items-center gap-1 bg-[#0d2137] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-sm hover:bg-[#1a3a5c] transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New
                  </button>
                </div>

                {showAddAddr && (
                  <form onSubmit={handleAddAddress} className="bg-gray-50 border border-gray-200 p-5 rounded-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">Add New Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        required
                        className="border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#4a6d98] focus:outline-none rounded-sm"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        required
                        className="border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#4a6d98] focus:outline-none rounded-sm"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address Line 1 *"
                      value={newAddr.addressLine1}
                      onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                      required
                      className="w-full border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#4a6d98] focus:outline-none rounded-sm"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={newAddr.addressLine2}
                      onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                      className="w-full border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#4a6d98] focus:outline-none rounded-sm"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="City *"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        required
                        className="border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#4a6d98] focus:outline-none rounded-sm"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        required
                        className="border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#4a6d98] focus:outline-none rounded-sm"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code *"
                        value={newAddr.postalCode}
                        onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                        required
                        className="border border-gray-300 bg-white px-3 py-2 text-xs focus:border-[#4a6d98] focus:outline-none rounded-sm"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddAddr(false)}
                        className="px-4 py-1.5 border border-gray-300 text-xs font-semibold text-gray-600 rounded-sm hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingAddr}
                        className="px-5 py-1.5 bg-[#0d2137] text-white text-xs font-bold uppercase rounded-sm hover:bg-[#1a3a5c] disabled:opacity-50"
                      >
                        {submittingAddr ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                )}

                {addressLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0d2137]" />
                  </div>
                ) : addresses.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">No saved addresses found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr._id} className="border border-gray-200 p-4 rounded-sm text-xs relative space-y-1">
                        {addr.isDefault && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            DEFAULT
                          </span>
                        )}
                        <p className="font-bold text-gray-900">{addr.fullName}</p>
                        <p className="text-gray-600">{addr.addressLine1} {addr.addressLine2}</p>
                        <p className="text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="text-gray-500 font-medium">Ph: {addr.phone}</p>

                        <div className="pt-3 flex items-center justify-between border-t border-gray-100 text-[11px]">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefault(addr._id)}
                              className="text-[#4a6d98] font-semibold hover:underline cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer ml-auto"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
