import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import config from "../config";

export function parseBadToken(value : string) : BigNumber{
    return parseUnits(value, config.decimals);
}