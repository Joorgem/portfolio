const ParallaxBackground = () => {
  return (
    <section className="absolute inset-0">
      <div className="relative h-screen">
        {/* Background - Pure Black */}
        <div
          className="absolute inset-0 w-full h-screen -z-50"
          style={{
            backgroundColor: "#000000",
          }}
        />
      </div>
    </section>
  );
};

export default ParallaxBackground;
