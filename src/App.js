import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button, Container, Heading, SimpleGrid, GridItem, Box, Image, Center } from '@chakra-ui/react'
import House from "./artifacts/House.json"
import axios from 'axios';

const CARDURL = "https://5ywn6daenz6poefpjkgs3c2vdgtzsk2vevam6ap7mvc4443iwdfq.arweave.net/xbVrNgugU0iJiDpb1LGMmT8tVmaL0M-LdikqE5OsSfk";
// 0xcb137655081D91C4b7cC40801f1FECd858A27dda
// 0x62608E465818BCf6f14776fe70aF242f1b09331C
// 0x1788Fd49B30c95c4A48c3a05D868156cB521f4a5
// 0xAAc4C396dB7f6cc2F3de3f50d5884A62405bB51A
// 0xC74A927D780C21c93dbb6f3FE42FF8aedFc2f95F
// 0xdE5FA7D4f00B3b447D9f348cCbCC79acCa7dd3FE
const CONTRACT_ADDRESS = "0x44E0A12282c04848Ffc5b9c4cD7Ce8875746C97f"; //

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [houseContract, setHouseContract] = useState();
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);

  const [items, setItems] = useState([]);

  const addItem = (tokenId) => {
    setItems([...items, tokenId ]);
    console.log(tokenId)
  }

  // const removeItem = (tokenId) => {
  //   setItems(items.filter(item => item.tokenId !== tokenId));
  // }

  // const hasTokenID = (tokenID) => {
  //   for (let index = 0; index < items.length; index++) {
  //     if(items.tokenId == tokenID) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  useEffect(() => {
    checkIfWalletIsConnected();
    
  }, []);

  const checkNetwork = async () => {
    const { ethereum } = window;
    try { 
      if (ethereum.networkVersion !== '4') {
        alert(`Please connect to Rinkeby! Network: ${ethereum.networkVersion}`)
      }
    } catch(error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async() => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch(error) {
      console.log(error);
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      const apiKey = "Vnexdndekfzn0TYv7bNC5FvMcbMdMZy-";
      const baseURL = `https://eth-rinkeby.alchemyapi.io/v2/${apiKey}/getNFTs/`;

      var config = {
        method: 'get',
        url: `${baseURL}?owner=${currentAccount}&withMetadata=true&contractAddresses[]=${CONTRACT_ADDRESS}`
      };

      axios(config)
      .then(response => {
        response.data.ownedNfts.forEach(nft => {
          const json = atob(nft.tokenUri.raw.substring(29));
          const result = JSON.parse(json);
          result.tokenId = parseInt(nft.id.tokenId,16)
          setCards(prev => [...prev, result])
        });

      })
      .catch(error => console.log(error));
    }
    if (currentAccount) {
      console.log('CurrentAccount', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  useEffect(() => {
    const onCardMinted = (sender, tokenId, cardIndex) => {
      console.log(`CardNFTMinted: tokenId: ${tokenId.toNumber()} CardIndex: ${cardIndex.toNumber()}`);
    };

    if(houseContract) {
      houseContract.on('CardNFTMinted', onCardMinted);
    }

    return () => {
      if (houseContract) {
          houseContract.off('CardNFTMinted', onCardMinted);
      }
    }
  }, [houseContract])

  const mintCard = async () => {
    console.log(cards)
    // try {
    //   if(houseContract) {
    //     console.log('Minting card in progress...');
    //     const mintTxn = await houseContract.mintCard();
    //     await mintTxn.wait();
    //     console.log('mintTxn: ', mintTxn);
    //   }
    // } catch(error) {
    //   console.warn("MintCardAction Error:", error);
    // }
  }

  const mintSet = async () => {
    console.log(items)
    try {
      console.log(houseContract)
      if(houseContract) {
        console.log('Minting Set in progress...');
        const mintTxn = await houseContract.mintSet(items);
        await mintTxn.wait();
        console.log('mintTxn: ', mintTxn);
      }
    } catch(error) {
      console.warn("MintSetAction Error:", error);
    }
  }

  const displayCollection = () => {
    
    return (
      <Container>
        <Heading style={{marginTop :"10px", marginBottom:"10px"}} size="md">{currentAccount}</Heading>
        <Button onClick={mintCard}>Mint</Button>
        <Button onClick={mintSet}>Mint Set</Button>
        <SimpleGrid minChildWidth='120px' spacing='20px' style={{marginTop:"10px"}}>
          {
            [].concat(cards)
            .sort((a, b) => parseInt(a.cardIndex) > parseInt(b.cardIndex) ? 1 : -1)
            .map((item, i) => {

              // let s = hasTokenID(item.tokenId.toNumber()) ? "red" : "black"
              // border:`5px solid black`,
              return(
                <Box key={i}  style={{ borderRadius:"15px", padding:"0"}} onClick={() => addItem(item.tokenId)}>
                  <Image src={item.image} alt='Dan Abramov' />
                </Box>
              )
            })
          }
        </SimpleGrid>
      </Container>
    )
  }

  const displayConnect = () => {
    return(
      <Container>
        <Center style={{marginTop:"20%"}}>
          <Button onClick={connectWalletAction}>Connect</Button>
        </Center>
      </Container>
    )
  }

  return (
    <div className="App">
      {currentAccount ? displayCollection() : displayConnect()}
    </div>
  );
}

export default App;
