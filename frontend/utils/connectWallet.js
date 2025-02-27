import { BrowserProvider } from "ethers";

export const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return null;
        }

        const provider = new BrowserProvider(window.ethereum);

        await window.ethereum.request({ method: "eth_requestAccounts" });

        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        return { provider, signer, address };
    } catch (error) {
        console.error("Error connecting wallet:", error);
        return null;
    }
};
