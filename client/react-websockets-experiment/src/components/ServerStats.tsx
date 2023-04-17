import React, { useState, useEffect } from "react";
import { Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup, Text } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

import usePrevious from "../usePrevious";
import { socket } from "../socket";

type ServerStatsProps = {
  isConnected: boolean;
};

const ServerStats = ({ isConnected = false }: ServerStatsProps) => {
  const [serverState, setServerState] = useState({ connectedUsers: 0 });
  const previousServerState = usePrevious(serverState);

  useEffect(() => {
    const onServerStateChange = (state: any) => {
      setServerState(state);
    };

    socket.on("serverStateChange", onServerStateChange);

    return () => {
      socket.off("serverStateChange", onServerStateChange);
    };
  }, []);

  return (
    <StatGroup sx={{ minWidth: "16rem" }}>
      <Stat variant="">
        <StatLabel>Connected Users</StatLabel>
        {/* <StatNumber>{serverState.connectedUsers}</StatNumber> */}
        <StatHelpText>
          <StatArrow
            type={serverState.connectedUsers > previousServerState?.connectedUsers ? "increase" : "decrease"}
          />
          {serverState.connectedUsers}
        </StatHelpText>
      </Stat>

      <Stat>
        <StatLabel>WS Connected</StatLabel>
        {/* <StatNumber>45</StatNumber> */}
        <StatHelpText>
          {/* <StatArrow type="decrease" /> */}
          {isConnected ? (
            <Text as="span" color="green">
              <CheckCircleIcon color="green" sx={{ marginRight: "4px" }} />
              connected
            </Text>
          ) : (
            <Text as="span" color="tomato">
              <WarningIcon color="tomato" sx={{ marginRight: "4px" }} />
              disconnected
            </Text>
          )}
        </StatHelpText>
      </Stat>
    </StatGroup>
  );
};

export default ServerStats;
