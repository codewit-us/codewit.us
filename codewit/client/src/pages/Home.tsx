const Home = (): JSX.Element => {

  return (
    <div className="h-container-full max-w-full overflow-auto bg-zinc-900">
      <div className="flex justify-center items-center h-container-full bg-zinc-900">
        <img src = "/hexicon.png" alt="codewitus bulb" className=" opacity-75 w-25 h-20" />
        <div className="text-left opacity-75">
          <h2 className = "font-medium text-white">Home Page</h2>
        </div>
      </div> 
    </div>
  );
  
};

export default Home;