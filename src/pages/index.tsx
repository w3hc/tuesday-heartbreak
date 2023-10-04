import { Text, Button, useToast } from '@chakra-ui/react'
import { Head } from 'components/layout/Head'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { LinkComponent } from 'components/layout/LinkComponent'
import { useState, useEffect } from 'react'
import { useAccount, useNetwork, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from '../utils/nft'
import { walletClientToSigner, useEthersSigner } from '../hooks/ethersAdapter'

export default function Home() {
  const { isConnected } = useAccount()
  const { data: walletClient, isError } = useWalletClient()
  const toast = useToast()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [signer, setSigner] = useState<any>()
  const [txLink, setTxLink] = useState<string>()
  const [txHash, setTxHash] = useState<string>()

  useEffect(() => {
    const init = async () => {
      console.log('isConnected:', isConnected)
      if (walletClient) {
        setSigner(walletClientToSigner(walletClient))
      }
    }
    init()
  }, [walletClient])

  const mint = async () => {
    try {
      if (!walletClient) {
        toast({
          title: 'No wallet',
          description: 'Please connect your wallet first.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
        return
      }
      setIsLoading(true)
      setTxHash('')
      setTxLink('')
      const nft = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
      const call = await nft.safeMint(signer.address)
      const receipt = await call.wait()
      console.log('tx:', receipt)
      setTxHash(receipt.hash)
      setTxLink('https://explorer-test.arthera.net/tx/' + receipt.hash)
      setIsLoading(false)
      toast({
        title: 'Successful mint',
        description: 'Congrats, your NFT was minted! 🎉',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 20000,
        isClosable: true,
      })
    } catch (e) {
      setIsLoading(false)
      console.log('error:', e)
      toast({
        title: 'Woops',
        description: 'Something went wrong during the minting process...',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Head />

      <main>
        <HeadingComponent as="h2">Hi there! 👋</HeadingComponent>
        <Button
          mt={4}
          colorScheme="blue"
          variant="outline"
          type="submit"
          onClick={mint}
          isLoading={isLoading}
          loadingText="Minting..."
          spinnerPlacement="end">
          Mint
        </Button>
        {txHash && (
          <Text py={4} fontSize="14px" color="#45a2f8">
            <LinkComponent href={txLink ? txLink : ''}>{txHash}</LinkComponent>
          </Text>
        )}
      </main>
    </>
  )
}
