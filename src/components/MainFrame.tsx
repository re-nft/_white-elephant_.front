import React from "react";
import { Box, Typography } from "@material-ui/core";
// import { ethers } from "ethers";

// import ContractsContext from "../contexts/Contracts";
// import DappContext from "../contexts/Dapp";
// import MeContext from "../contexts/Me";
// import usePoller from "../hooks/Poller";

// // import Spinner from "./Spinner";

// type Data = {
//   address: string;
//   order: number;
// };

// type UnwrapButtonProps = {
//   normalUnwrap: () => Promise<void>;
//   stolenUnwrap: () => Promise<void>;
//   useStolenUnwrap: boolean;
// };

// const UnwrapButton: React.FC<UnwrapButtonProps> = ({
//   normalUnwrap,
//   stolenUnwrap,
//   useStolenUnwrap,
// }) => {
//   const handleUnwrap = useCallback(async () => {
//     if (useStolenUnwrap) {
//       return await stolenUnwrap();
//     }
//     return await normalUnwrap();
//   }, [normalUnwrap, stolenUnwrap, useStolenUnwrap]);

//   return (
//     <Button variant="outlined" onClick={handleUnwrap}>
//       Unwrap
//     </Button>
//   );
// };

// const Table = () => {
//   const { whiteElephant } = useContext(ContractsContext);
//   const [data, setData] = useState<Data[]>([]);
//   const [currTurn, setCurrTurn] = useState<string>("");

//   const handleData = useCallback(async () => {
//     const { contract } = whiteElephant;
//     if (!contract) return;
//     const totalNumPlayers = await contract.numberOfPlayers();
//     const allPlayers: Data[] = [];
//     for (let i = 0; i < totalNumPlayers; i++) {
//       const player = await contract.getPlayerNumber(i);
//       allPlayers.push({ address: player, order: i + 1 });
//     }
//     const _currTurn = await contract.playersTurn();
//     console.debug("curr player", _currTurn);
//     setCurrTurn(_currTurn);
//     setData(allPlayers);
//   }, [whiteElephant]);

//   usePoller(handleData, 3000);

//   if (data.length < 1) return <></>;

//   return (
//     <Box>
//       <Typography
//         variant="h6"
//         style={{ fontWeight: "bold", marginBottom: "1em" }}
//       >
//         There shall-eth be order-eth
//       </Typography>
//       <Typography variant="caption">
//         On Christmas day, take turns and unwrap or steal the presents. The
//         higlighted address takes turn now
//       </Typography>
//       <table style={{ margin: "auto" }}>
//         <thead>
//           <tr>
//             <th>Player Address</th>
//             <th>Their Turn #</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data &&
//             data.map((d) => (
//               <tr
//                 key={d.address}
//                 style={{ background: currTurn === d.address ? "green" : "" }}
//               >
//                 <td>{d.address}</td>
//                 <td>{d.order}</td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </Box>
//   );
// };

const MainFrame: React.FC = () => {
  // const { address } = useContext(DappContext);
  // const { whiteElephant } = useContext(ContractsContext);
  // const { prize, enableCheckingPrize, getPrizeInfo } = useContext(MeContext);
  // const [error, setError] = useState<string>("");

  // const unwrap = useCallback(async () => {
  //   const { contract } = whiteElephant;
  //   if (!contract) return;
  //   try {
  //     const tx = await contract.unwrap();
  //     await tx.wait(1);
  //     enableCheckingPrize();
  //     await getPrizeInfo();
  //   } catch (err) {
  //     setError(err?.data?.message || "unknown");
  //   }
  // }, [enableCheckingPrize, getPrizeInfo, whiteElephant]);

  // const stolenUnwrap = useCallback(async () => {
  //   const { contract } = whiteElephant;
  //   if (!contract) return;
  //   try {
  //     const tx = await contract.unwrapAfterSteal();
  //     await tx.wait(1);
  //     enableCheckingPrize();
  //     await getPrizeInfo();
  //   } catch (err) {
  //     setError(err?.data?.message || "unknown");
  //   }
  // }, [enableCheckingPrize, getPrizeInfo, whiteElephant]);

  return (
    <Box>
      <Box style={{ marginBottom: "4em" }}>
        <Typography variant="h3">
          Thy <span className="rainbow-text">Prize</span> shall-eth be here-eth
        </Typography>
      </Box>
    </Box>
  );
};

export default MainFrame;
