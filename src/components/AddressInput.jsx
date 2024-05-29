import { useCallback, useEffect, useState } from "react";
import { getEllipsisTxt } from "../helpers/formatters";
import { Input } from "antd";

function AddressInput(props) {
  const [address, setAddress] = useState("");
  const [validatedAddress, setValidatedAddress] = useState("");

  useEffect(() => {
    if (validatedAddress) props.onChange(address);
  }, [address]);

  const updateAddress = useCallback((address) => {
    if (address.length === 42) setValidatedAddress(getEllipsisTxt(address, 10));
    setAddress(address);
  }, []);

  const Cross = () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="blue"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={() => setValidatedAddress("")}
      style={{ cursor: "pointer" }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <Input
      size="large"
      placeholder={props.placeholder ? props.placeholder : "Public address 0x"}
      suffix={validatedAddress && <Cross />}
      autoFocus={props.autoFocus}
      value={validatedAddress || address}
      onChange={(e) => {
        updateAddress(e.target.value);
      }}
      disabled={validatedAddress}
      style={
        validatedAddress
          ? { ...props?.style, border: "1px solid blue" }
          : { ...props?.style }
      }
    />
  );
}

export default AddressInput;
