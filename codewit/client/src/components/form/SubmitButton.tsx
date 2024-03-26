const SubmitBtn = ({text, disabled = false}: {text: string, disabled?: boolean}): JSX.Element => {
  return (
    <div className="flex justify-end py-2">
      <button 
        disabled={disabled}
        type="submit"
        data-testid="submitbtn" 
        className="text-white w-full bg-accent-500 hover:bg-accent-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm py-2 px-3 text-center transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {text}
      </button>
    </div>  
  )
}

export default SubmitBtn;