import { Action, io } from "@interval/sdk";

const action = new Action(async (def) => {
  const customerEmail = await def.input.email(
    "Email of the customer to refund:",
  );

  await io.display.heading("Refunding customer");

  console.log("Email:", customerEmail);
});

export default action;
