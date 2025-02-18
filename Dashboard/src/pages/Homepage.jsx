import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2, DownloadCloud, UploadCloud, Link } from "lucide-react"
import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { getTotalNumberOfGames, getTotalNumberOfAllowedDownloadGames, getNumberOfSelfUploadedGames, getNumberofUploadedGamesByLink } from "@/store/Slices/gameSlice"
import { Loader } from "./sub-components"

const Homepage = () => {
  const dispatch = useDispatch()
  const games = useSelector((state) => state.game.totalGames)
  const allowedDownloads = useSelector((state) => state.game.DownloadAllowedGames)
  const gameUploadedByLink = useSelector((state) => state.game.NumberofUploadedGamesByLink)
  const selfUploadedGames = useSelector((state) => state.game.NumberOfSelfUploadedGames)

  const [animatedGames, setAnimatedGames] = useState(0)
  const [animatedDownloads, setAnimatedDownloads] = useState(0)
  const [animatedUploadedByLink, setAnimatedUploadedByLink] = useState(0)
  const [animateSelfUploaded, setanimateSelfUploaded] = useState(0)
  const [loader, setloader] = useState(true);




  const prevGamesRef = useRef(games)
  const prevDownloadsRef = useRef(allowedDownloads)
  const prevUploadedByLinkRef = useRef(gameUploadedByLink)
  const prevSelfUploadedRef = useRef(selfUploadedGames)


  // for custom laoder

  useEffect(() => {

    const intervalId = setTimeout(() => {
      setloader(false)
    }, 1000)

    return () => {
      clearTimeout(intervalId)
    }

  })







  // Fetch total games and allowed downloads ,selfUploaded,uploaded on link on mount
  useEffect(() => {
    if (!prevGamesRef.current) {
      dispatch(getTotalNumberOfGames())
    }
    if (!prevDownloadsRef.current) {
      dispatch(getTotalNumberOfAllowedDownloadGames())
    }
    if (!prevSelfUploadedRef.current) {
      dispatch(getNumberOfSelfUploadedGames())
    }
    if (!prevUploadedByLinkRef.current) {
      dispatch(getNumberofUploadedGamesByLink())
    }
  }, [dispatch])

  // Animate total games count
  useEffect(() => {
    prevGamesRef.current = games

    if (games) {
      let count = 0
      const interval = setInterval(() => {
        setAnimatedGames((prev) => {
          if (prev >= games) {
            clearInterval(interval)
            return games
          }
          return prev + Math.ceil(games / 50)
        })
      }, 20)
    }
  }, [games])

  // Animate total allowed downloads count
  useEffect(() => {
    prevDownloadsRef.current = allowedDownloads

    if (allowedDownloads) {
      let count = 0
      const interval = setInterval(() => {
        setAnimatedDownloads((prev) => {
          if (prev >= allowedDownloads) {
            clearInterval(interval)
            return allowedDownloads
          }
          return prev + Math.ceil(allowedDownloads / 50)
        })
      }, 20)
    }
  }, [allowedDownloads])


  // Animat Self Uploaded Count

  useEffect(() => {
    prevSelfUploadedRef.current = selfUploadedGames

    if (selfUploadedGames) {
      let count = 0
      const interval = setInterval(() => {
        setanimateSelfUploaded((prev) => {
          if (prev >= selfUploadedGames) {
            clearInterval(interval)
            return selfUploadedGames
          }
          return prev + Math.ceil(selfUploadedGames / 50)
        })
      }, 20)
    }
  }, [selfUploadedGames])

  // Animate Game Uploaded By Link

  useEffect(() => {
    prevUploadedByLinkRef.current = gameUploadedByLink

    if (gameUploadedByLink) {
      let count = 0
      const interval = setInterval(() => {
        setAnimatedUploadedByLink((prev) => {
          if (prev >= gameUploadedByLink) {
            clearInterval(interval)
            return gameUploadedByLink
          }
          return prev + Math.ceil(gameUploadedByLink / 50)
        })
      }, 20)
    }
  }, [gameUploadedByLink])





  return (
    loader ? <Loader /> : (
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 text-white p-6 rounded-lg shadow-lg">
          <div>
            <h1 className="text-3xl font-bold">Welcome, Admin! 🎮</h1>
            <p className="text-gray-300">Manage your dashboard with ease.</p>
          </div>
          <img
            src="/k4-media-and-technologies-mobile-logo.png"
            alt="Logo"
            className="w-32 h-16 sm:w-40 sm:h-20 md:w-48 md:h-24 lg:w-56 lg:h-28 xl:w-64 xl:h-32"
          />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Total Games */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gamepad2 className="w-6 h-6 text-blue-500" />
                <span>Total Games</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.h2
                className="text-4xl font-bold"
                animate={{ opacity: [0, 1], scale: [0.8, 1] }}
                transition={{ duration: 0.5 }}
              >
                {animatedGames}
              </motion.h2>
            </CardContent>
          </Card>

          {/* Total Allowed Downloads */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DownloadCloud className="w-6 h-6 text-green-500" />
                <span>Total Allowed Downloads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.h2
                className="text-4xl font-bold"
                animate={{ opacity: [0, 1], scale: [0.8, 1] }}
                transition={{ duration: 0.5 }}
              >
                {animatedDownloads}
              </motion.h2>
            </CardContent>
          </Card>


          {/* Self Uploaded Games */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UploadCloud className="w-6 h-6 text-blue-500" />
                <span>Self Uploaded Games</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.h2
                className="text-4xl font-bold"
                animate={{ opacity: [0, 1], scale: [0.8, 1] }}
                transition={{ duration: 0.5 }}
              >
                {animateSelfUploaded}
              </motion.h2>
            </CardContent>
          </Card>

          {/* Game Uploaded By Link */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="w-6 h-6 text-blue-500" />
                <span>Game Uploaded By Link</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.h2
                className="text-4xl font-bold"
                animate={{ opacity: [0, 1], scale: [0.8, 1] }}
                transition={{ duration: 0.5 }}
              >
                {animatedUploadedByLink}
              </motion.h2>
            </CardContent>
          </Card>

        </div>
      </div>
    )


  )
}

export { Homepage }
