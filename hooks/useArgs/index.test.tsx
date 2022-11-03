import { faker } from "@faker-js/faker";
import { AbiParameterWithComponents } from "core/types";
import { BigNumber } from "ethers";
import { times } from "lodash";
import { act, renderHook } from "testing";
import {
  buildAddress,
  buildInput,
  buildInputList,
  buildInputWithComponents,
} from "testing/factory";
import { useArgs } from ".";

describe("useArgs", () => {
  it("should return args", () => {
    const inputs = buildInputList(0) as AbiParameterWithComponents[];
    const { result } = renderHook(() => useArgs(inputs));

    expect(result.current.args).toEqual([]);
  });

  it("should initialize each input with an empty string", () => {
    const inputs = buildInputList(2) as AbiParameterWithComponents[];
    const { result } = renderHook(() => useArgs(inputs));

    expect(result.current.args).toEqual([
      { name: inputs[0].name, type: inputs[0].type, value: "" },
      { name: inputs[1].name, type: inputs[1].type, value: "" },
    ]);
  });

  it("should initialize inputs for tuple types", () => {
    const input = buildInputWithComponents({
      components: buildInputList(2) as AbiParameterWithComponents[],
    });
    const { result } = renderHook(() => useArgs([input]));

    expect(result.current.args).toEqual([
      {
        name: input.name,
        type: input.type,
        value: [
          {
            name: input.components![0].name,
            type: input.components![0].type,
            value: "",
          },
          {
            name: input.components![1].name,
            type: input.components![1].type,
            value: "",
          },
        ],
      },
    ]);
  });

  it("should update the speficied arg", () => {
    const value = "foo";
    const input1 = buildInput({ type: "string" });
    const input2 = buildInput({ type: "string" });
    const inputs = [input1, input2] as AbiParameterWithComponents[];
    const { result } = renderHook(() => useArgs(inputs));

    act(() => {
      result.current.updateValue([1], value);
    });

    expect(result.current.args).toEqual([
      { name: input1.name, type: input1.type, value: "" },
      { name: input2.name, type: input2.type, value },
    ]);
  });

  it("should update the speficied arg for tuple types", () => {
    const value = "foo";
    const input = buildInputWithComponents({
      components: buildInputList(2) as AbiParameterWithComponents[],
    });
    const inputs = [input] as AbiParameterWithComponents[];
    const { result } = renderHook(() => useArgs(inputs));

    act(() => {
      result.current.updateValue([0, 1], value);
    });

    expect(result.current.args).toEqual([
      {
        name: input.name,
        type: input.type,
        value: [
          {
            name: input.components![0].name,
            type: input.components![0].type,
            value: "",
          },
          {
            name: input.components![1].name,
            type: input.components![1].type,
            value,
          },
        ],
      },
    ]);
  });

  it("should return formatted big number args", () => {
    const value = "1";
    const input = buildInput({ type: "uint256" });
    const { result } = renderHook(() =>
      useArgs([input] as AbiParameterWithComponents[])
    );

    act(() => {
      result.current.updateValue([0], value);
    });

    expect(result.current.formattedArgs).toEqual([BigNumber.from(value)]);
  });

  it("should return provided value when big number conversion throws", () => {
    const value = faker.random.word();
    const input = buildInput({ type: "uint256" });
    const { result } = renderHook(() =>
      useArgs([input] as AbiParameterWithComponents[])
    );

    act(() => {
      result.current.updateValue([0], value);
    });

    expect(result.current.formattedArgs).toEqual([value]);
  });

  it("should return formatted args for string array", () => {
    const value = "foo, bar, baz";
    const input = buildInput({ type: "string[]" });
    const { result } = renderHook(() =>
      useArgs([input] as AbiParameterWithComponents[])
    );

    act(() => {
      result.current.updateValue([0], value);
    });

    expect(result.current.formattedArgs).toEqual([["foo", "bar", "baz"]]);
  });

  it("should return formatted args for address array", () => {
    const addresses = times(3, () => buildAddress());
    const value = addresses.join(", ");
    const input = buildInput({ type: "address[]" });
    const { result } = renderHook(() =>
      useArgs([input] as AbiParameterWithComponents[])
    );

    act(() => {
      result.current.updateValue([0], value);
    });

    expect(result.current.formattedArgs).toEqual([addresses]);
  });

  it("should return formatted args for uint256[]", () => {
    const values = "1, 2, 3";
    const input = buildInput({ type: "uint256[]" });
    const { result } = renderHook(() =>
      useArgs([input] as AbiParameterWithComponents[])
    );

    act(() => {
      result.current.updateValue([0], values);
    });

    expect(result.current.formattedArgs).toEqual([
      [BigNumber.from(1), BigNumber.from(2), BigNumber.from(3)],
    ]);
  });

  it("should return formatted args for tuple", () => {
    const value = "foo";
    const components = buildInputList(2) as AbiParameterWithComponents[];
    const input = buildInputWithComponents({ type: "tuple", components });
    const { result } = renderHook(() => useArgs([input]));

    act(() => {
      result.current.updateValue([0, 1], value);
    });

    expect(result.current.formattedArgs).toEqual([
      {
        [input.components![0].name]: "",
        [input.components![1].name]: value,
      },
    ]);
  });
});
