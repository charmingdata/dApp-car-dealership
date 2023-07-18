import Head from "next/head";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { Inter } from "next/font/google";
import Web3Modal from "web3modal";
import { providers, Contract, utils, BigNumber } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MY_CONTRACT_ADDRESS, abi } from "../constants";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationReason, setDonationReason] = useState("");
  const [donationAmount, setDonationAmount] = useState(0);
  const web3ModalRef = useRef();
  const [filteredEvents, setFilteredEvents] = useState([]);

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the zkEVM network, let them know by throwing an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 1442) {
      window.alert("Change the network to zkEVM");
      throw new Error("Change network to zkEVM");
    }

    if (needSigner) {
      return web3Provider.getSigner();
    }
    return web3Provider;
  };

  useEffect(() => {
    const initializeWeb3Modal = () => {
      web3ModalRef.current = new Web3Modal({
        network: "zkEVM",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    };

    if (!walletConnected) {
      initializeWeb3Modal();
      connectWallet();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (walletConnected) {
      return <span>connected</span>;
    } else {
      return (
        <button
          style={{ cursor: "pointer", backgroundColor: "blue" }}
          onClick={connectWallet}
        >
          Connect your wallet
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Car Dealership dApp</title>
        <meta name="description" content="Car-dealership-dapp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div>
          <h1 className={styles.title}>Welcome to Web3 Car Dealership!</h1>
          <div className={styles.description}>
            A Blockchain for buying and selling cars.
          </div>
          <br></br>
          <div>
            {renderButton()}
          </div>
        </div>
      </main>
    </div>
  );
}