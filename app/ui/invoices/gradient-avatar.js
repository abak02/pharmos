
export default function GetRandomAvatar({name}) {
  
  
    const gradients = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-teal-500 to-cyan-600",
    "from-indigo-500 to-blue-600",
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-green-600",
    "from-violet-500 to-purple-600",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 10) - hash);
  }

  const index = Math.abs(hash) % gradients.length;

  return(
    <>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${gradients[index]} rounded-full flex items-center justify-center shadow-lg`}
        >
          <span className="text-white font-semibold text-lg">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      
    </>
  );

}