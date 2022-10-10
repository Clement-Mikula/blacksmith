import { render, screen } from "testing";
import { buildAbiDefinedFunction, buildInputList } from "testing/factory";
import Nonpayable from ".";

describe("Nonpayable", () => {
  it("should render function name", () => {
    const func = buildAbiDefinedFunction();

    render(<Nonpayable func={func} />);

    expect(screen.getByText(func.name, { exact: false })).toBeInTheDocument();
  });

  it("should render function inputs", () => {
    const inputs = buildInputList(2);
    const func = buildAbiDefinedFunction({ inputs });

    render(<Nonpayable func={func} />);

    func.inputs.forEach((input) => {
      expect(
        screen.getByLabelText(`${input.name} :: ${input.type}`)
      ).toBeInTheDocument();
    });
  });
});
