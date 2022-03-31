#!/bin/sh
set -e

# node id
NODE_ID_FILE=${DATA_DIR}/.nodeid

# check if node was not initialised
if [ ! -f "$NODE_ID_FILE" ]; then

    # warn
    echo "Node file (${NODE_ID_FILE}) was not initialised before. Attempting to init..."

    # init new node id and store in .nodeid file
    polygon-edge secrets init --data-dir ${DATA_DIR} >${NODE_ID_FILE}

    # parse id from output of file
    NODE_ID=$(grep "Node" ${NODE_ID_FILE} | tail -c 54)
    PUBLIC_ADD=$(grep "Public" ${NODE_ID_FILE} | tail -c 43)

    # confirm
    echo "Node was successfully initialised with id ${NODE_ID}"

    # initialise genesis file
    if [ ${BOOTNODE} == "y" ]; then

        cd /tmp
        polygon-edge genesis --consensus ibft --ibft-validator=${PUBLIC_ADD} --bootnode /ip4/127.0.0.1/tcp/10001/p2p/${NODE_ID} --premine=${ACCOUNT}:${AMOUNT} --block-gas-limit 600000000
        cat /tmp/genesis.json >/genesis.json
        cd /

        echo "Genesis file was successfully configured"

    else

        # not a bootnode; skipping genesis file generation
        echo "Genesis file generation omitted - not a bootnode..."

    fi

else

    # skip
    echo "Node was already initialised. Skipping configuration..."

fi

GENESIS_FILE=/genesis.json
echo "Genesis file location: ${GENESIS_FILE}"

echo "Starting Polygon Edge node under ${DATA_DIR}"
polygon-edge server --data-dir ${DATA_DIR} --chain ${GENESIS_FILE} --grpc :${GRPC_PORT} --libp2p :${LIBP2P_PORT} --jsonrpc :${JSONRPC_PORT} --seal
