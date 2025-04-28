import { connect, disconnect, getPublicKey } from "@/lib/stellar";
import { Button } from "../ui/button";
import { toast } from 'sonner'
import { useState, useEffect } from "react";

const Navbar = () => {
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const publicKey = await getPublicKey();
                if (publicKey) {
                    setAddress(publicKey);
                    setConnected(true);
                }
            } catch (error) {
                console.error("Error checking connection:", error);
            }
        };

        checkConnection();
    }, []);

    const connectWallet = async () => {
        try {
            await connect(async () => {
                const publicKey = await getPublicKey();
                setAddress(publicKey);
                setConnected(true);
            });
        } catch (error) {
            console.error("Error connecting wallet:", error);
            toast.error("Failed to connect wallet");
        }
    };

    const disconnectWallet = async () => {
        try {
            await disconnect(async () => {
                setAddress(null);
                setConnected(false);
            });
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
            toast.error("Failed to disconnect wallet");
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 flex justify-between py-3 px-2 bg-blue-900 text-white">
            <h1 className="text-xl">Stellar</h1>
            {connected ? (
                <>
                    <p>Connected: {address}</p>
                    <Button onClick={disconnectWallet}>
                        Disconnect
                    </Button>
                </>
            ) : (
                <Button id="connectButton" onClick={connectWallet}>
                    Connect Wallet
                </Button>
            )}
        </nav>
    );
};

export default Navbar;