import FullPageWrapper from "./components/FullPageWrapper";
import ConnectedTextNetwork from "./components/ConnectedTextNetwork";
import MainDepthScene from "./components/MainDepthScene";

function App() {
  return (
    <FullPageWrapper>
      <section
        className={`h-screen w-screen flex items-center justify-center bg-blue-500 text-white text-4xl`}
      >
        Page 1
      </section>
      <section
        className={`h-screen w-screen flex items-center justify-center bg-green-500 text-white text-4xl`}
      >
        Page 2
      </section>
      <section
        className={`h-screen w-screen flex items-center justify-center bg-purple-500 text-white text-4xl`}
      >
        Page 3
      </section>
      <section className="h-screen w-screen bg-black">
        <ConnectedTextNetwork />
      </section>
      <section className="h-screen w-screen bg-black">
        <MainDepthScene />
      </section>
    </FullPageWrapper>
  );
}

export default App;
