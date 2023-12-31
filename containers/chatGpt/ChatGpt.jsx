import React, { useState, useEffect } from "react";
import { adLabel } from "../../../server/constants";
import { pagesContent } from "../../../server/constants";
import Typed from "react-typed";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./chatGpt.css";

const ChatGpt = () => {
  //----------------------------------------------------------
  //Initial typed animation when no content has been generated yet
  const typedResultText = (
    <Typed
      strings={[
        "Take a moment to complete the form and create your ad!",
        "More fields, more details, better results!",
      ]} // The `strings` prop takes an array of strings to animate.
      typeSpeed={30}
      backSpeed={40}
      showCursor={false}
      loop // `loop` indicates whether the animation should repeat indefinitely.
    ></Typed>
  );
  const [answer, setAnswer] = useState(typedResultText);

  //----------------------------------------------------------
  // Loop through each key in `adLabel` to initialize form data.
  // and each value is initialized to an empty string.
  // Initialize form data to an empty object
  // This object will hold the initial state values for the form fields.
  let initialFormData = {};

  for (let key in adLabel) {
    initialFormData[key] = "";
  }

  const [formData, setFormData] = useState(initialFormData);

  //----------------------------------------------------------
  //called every time an input field changes.
  // This will dynamically update the formData.
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Use the spread operator '...' to include all existing key-value pairs from `formData`.
    // This keeps all other field values the same while updating the value for the key that matches the `name`.
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //----------------------------------------------------------
  // Handle submit logic called when the form is submitted.
  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstFieldName = Object.keys(adLabel)[0]; // grab the first field name
    const firstFieldValue = formData[firstFieldName]; // grab the first field value

    //Check if the first field value is empty and display a toast if it is
    if (firstFieldValue === "") {
      toast("Job Title field is empty. Please fill it out. 😊"); // This will display the toast with a smiley emoji
      return;
    }

    // Set the answer to the loading text
    setAnswer(typedLoadingText);
    // Generate the prompt
    const updatedPrompt = generatePrompt(formData);

    // Call the GPT API
    const apiEndpoint = import.meta.env.VITE_REACT_APP_API_ENDPOINT;
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: updatedPrompt }),
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse = data.answer;
        // Set the answer to the bot response from the API
        setAnswer(botResponse);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //----------------------------------------------------------
  // React's useEffect Hook to handle asynchronous state updates in `formData`.
  // Currently empty, but it's here to ensure that any logic dependent on `formData`
  // has the most up-to-date state.
  useEffect(() => {}, [formData]);

  //----------------------------------------------------------
  // Create a variable to store the updated prompt
  const generatePrompt = (formData) => {
    // Initialize the prompt with the first sentence
    let updatedPrompt = "This is a Job spec, please write a job ad for me.";
    // Loop through each field in the form data and add it to the prompt if it's not empty
    for (const field in formData) {
      if (formData[field] !== "") {
        updatedPrompt += `, ${field}: ${formData[field]}`;
      }
    }
    // return the updated prompt
    return updatedPrompt;
  };

  //----------------------------------------------------------
  const copyToClipboard = async () => {
    try {
      // Check if answer is a string because the typed animation is an object if it is a string this mean it has been generated by the API and can bve copied to the clipboard
      if (typeof answer === "string") {
        // Use navigator.clipboard.writeText to copy the text to the clipboard
        await navigator.clipboard.writeText(answer);
        toast("Copied to clipboard 😊"); // This will display the toast with a smiley emoji
      } else {
        toast(
          "Cannot copy to clipboard. The content has not been generated yet 😊"
        );
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  // -----------------------------------------------------------------------
  const typedLoadingText = (
    <Typed
      strings={[
        "Just a moment, we're crafting your content",
        "Hang tight, this might take between 20 and 30 seconds",
        "Fine-tuning your experience",
        "Brewing some magic",
        "It's worth the wait, trust us",
        "Almost there, thank you for your patience",
        "This usually takes between 20 and 30 seconds",
        "Keep calm, you're in good hands",
      ]}
      typeSpeed={80}
      backSpeed={60}
      showCursor={false}
      loop
    ></Typed>
  );

  return (
    <section className="max-container lg:px-10 px-4 text-[white] pt-8">
      <ToastContainer />

      <h1 className=" text-[4.4rem] font-extrabold w-1/2">
        <span className="text-[#9B40FF]">
          Creating {pagesContent.ads.pageName},
        </span>
        made simple
      </h1>
      <div className="flex flex-col md:flex-row gap-3 my-8">
        <div className="w-full xl:w-1/2">
          <div className="border border-[#cdd0f8] bg-[#EEEEEE] rounded-2xl ">
            <form
              className="flex flex-col gap-3 bg-[#EEEEEE] py-8 px-4 rounded-2xl"
              onSubmit={handleSubmit}
            >
              {Object.keys(adLabel).map((adLabelkey) => {
                const label = adLabel[adLabelkey];
                if (label.isActive) {
                  if (label.labelElement === "input") {
                    return (
                      <label
                        key={label.name}
                        className="bg-[#EEEEEE] text-[#9B40FF]"
                        htmlFor={label.name}
                      >
                        {label.labelName}
                        <input
                          type={label.type}
                          id={label.name} // Add an id here
                          name={label.name}
                          placeholder={label.placeholder}
                          style={{
                            focus: { backgroundColor: "#EEEEEE" },
                          }}
                          className="w-full border-b bg-[#EEEEEE] border-[#9B40FF] text-[#333333] outline-none"
                          onChange={handleChange}
                        />
                      </label>
                    );
                  }
                  if (label.type === "textarea") {
                    return (
                      <label
                        key={label.name}
                        className="bg-[#EEEEEE] text-[#9B40FF]"
                        htmlFor={label.name}
                      >
                        {label.labelName}
                        <textarea
                          id={label.id}
                          name={label.name}
                          rows={label.rows}
                          placeholder={label.placeholder}
                          style={{
                            focus: { backgroundColor: "#EEEEEE" },
                          }}
                          className="w-full border-b bg-[#EEEEEE] border-[#9B40FF] text-[#333333] outline-none"
                          onChange={handleChange}
                        />
                      </label>
                    );
                  }
                }
              })}

              {/* Actions */}
              <button
                type="submit"
                className="hover:bg-[#1c1a25] bg-[#9B40FF] text-[#EEEEEE] font-bold py-2 px-4 my-4 rounded"
              >
                Generate
              </button>
            </form>
          </div>
        </div>
        <div className="w-full xl:w-1/2 flex flex-col justify-between">
          <div className="">
            <div className="bg-[#EEEEEE] rounded-2xl text-[#333333] w-[24rem] p-4 hidden md:flex">
              <p>{pagesContent.ads.decriptionBox}</p>
            </div>
          </div>
          <div className="">
            <div className="flex justify-between items-end	">
              <h1 className="text-[#9B40FF] text-[4.4rem] font-extrabold py-2 rounded">
                Result
              </h1>
              <button
                className="hover:bg-[#1c1a25] bg-[#9B40FF] text-[#EEEEEE] font-bold rounded h-[2.5rem] px-2 mb-8"
                onClick={copyToClipboard}
              >
                Copy to Clipboard
              </button>
            </div>

            <div className="flex item-center max-h-[40rem] border-white overflow-hidden bg-[#EEEEEE] text-[#333333] leading-6 min-h-[80px] lg:min-h-[56px] rounded-2xl">
              <pre className="whitespace-pre-wrap overflow-auto max-h-[40rem] py-4 px-4">
                {answer}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatGpt;
