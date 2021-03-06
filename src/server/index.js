import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

// FIXME: сделать пути относительно корня NODE_PATH
import webpackConfig from '../../webpack/client.dev'
import handleRender from './handleRender'
import logger from '../../tools/logger'
import router from './router'
import seed from './seeds'

const app = express()

// TODO: add NODE_HOST to .env.example and .env

// Run Webpack dev server in development mode
if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: false,
      modules: false,
    },
  }))
  app.use(webpackHotMiddleware(compiler))
}

// Set native promises as mongoose promise
mongoose.Promise = global.Promise

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {useMongoClient: true}, err => {
  if (err) {
    logger.error('Please make sure Mongodb is installed and running!') // eslint-disable-line no-console
    logger.error(err.message)
    return
  }

  // seed some dummy data in DB.
  seed()
})

// Apply body Parser and server public assets and routes
app.use(compression())

// TODO: remove index.html
// TODO: add favicon
// app.use(express.static(path.join(process.cwd(), 'public')))

app.use(bodyParser.json({limit: '20mb'}))
app.use(bodyParser.urlencoded({limit: '20mb', extended: false}))

app.use('/api', router)

// app.use((req, res) => {
//   res.sendFile(path.join(process.cwd(), 'public', 'index.html'))
// })

// This is fired every time the server side receives a request
app.use(handleRender)

app.listen(process.env.NODE_PORT, process.env.NODE_HOST, err => {
  if (err) {
    logger.error(err.message)
    return
  }

  logger.log('Server started!')
  logger.appStarted(process.env.NODE_PORT, process.env.NODE_HOST)
})
