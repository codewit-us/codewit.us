const SubmitBtn = ({text}: {text: string}): JSX.Element => {
  return (
    <div className="flex justify-end py-2">
      <button 
        type="submit"
        data-testid="submitbtn" 
        className="text-white w-full bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm py-2 px-3 text-center transition-colors duration-200"
      >
        {text}
      </button>
    </div>  
  )
}

export default SubmitBtn;