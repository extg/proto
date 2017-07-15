

import React from 'react'
import Request from 'superagent'
import s from '../post-list/post-list-item.scss'
import {markdown} from '../../styles/markdown.scss'
import {Link} from 'react-router-dom'

function createMarkup(html) {return {__html: html}}

const Post = ({title, content, url, date, onClick}) => (
  <article className={s.article}>
    <header className={s.header}>
      <h2 className={s.title}>
        <Link to={`/posts/${title}`} className={s.link} onClick={onClick}>{title}</Link>
      </h2>
      <aside className={s.date}>{date}</aside>
    </header>
    <section className={markdown} dangerouslySetInnerHTML={createMarkup(content)} />
  </article>
);

class PostContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props
  }

  componentDidMount() {
    Request.get(`/api/posts/${this.state.title}`)
      .then(data => data.body)
      .then(article => this.setState(article))
  }

  render() {
    return (
      <Post {...this.state}/>
    );
  }
}

export {PostContainer as default, Post}
