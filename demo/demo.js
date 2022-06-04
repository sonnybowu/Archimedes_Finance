async function app() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let accounts;

    const isMetaMaskConnected = async () => {
        accounts = await provider.listAccounts();
        console.log("accounts", accounts);
        return accounts.length > 0;
    };

    await isMetaMaskConnected().then((connected) => {
        if (connected) {
            document.getElementById("mmBtn").innerHTML = "Connected";
            provider.getBalance(accounts[0]).then(function (data) {
                const prettyBalance = ethers.utils.formatEther(data);
                $("#balance").html("You have: " + prettyBalance + " ETH");
            });
        } else {
            $("#balance").hide();
            console.log("not connected");
            // metamask is not connected
        }
    });
}

async function connect() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    app();
}

app();
