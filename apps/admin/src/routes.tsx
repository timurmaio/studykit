import React from 'react'
import { Router, Route, browserHistory } from 'react-router'

// Components
import App from './components/App'
import MainLayout from './components/MainLayout'
import AuthLayout from './components/AuthLayout'
import Authentication from './components/Authentication'

// Pages

// Courses
import ListCourses from './pages/courses/ListCourses'
import NewCourse from './pages/courses/NewCourse/'
import ShowCourse from './pages/courses/ShowCourse/'

// Users
import ListUsers from './pages/users/ListUsers'
import NewUser from './pages/users/NewUser'
import ShowUser from './pages/users/ShowUser'

// Articles
import ListArticles from './pages/articles/ListArticles'
import NewArticle from './pages/articles/NewArticle'
import ShowArticle from './pages/articles/ShowArticle'

// Lectures
import ListLectures from './pages/lectures/ListLectures'
import NewLecture from './pages/lectures/NewLecture'
import ShowLecture from './pages/lectures/ShowLecture'

// LecturesContent
import ListLecturesContent from './pages/lectures_content/ListLecturesContent'
import NewLecturesContent from './pages/lectures_content/NewLecturesContent'
import ShowLecturesContent from './pages/lectures_content/ShowLecturesContent'

// import ImageUpload from './components/test'

const routes = (
  <Router history={browserHistory}>
    <Route component={App}>

      <Route component={AuthLayout}>
        <Route path='/' component={Authentication} />
      </Route>

      <Route component={MainLayout}>

        <Route path='/courses' component={ListCourses} />
        <Route path='/courses/new' component={NewCourse} />
        <Route path='/courses/:id' component={ShowCourse} />

        <Route path='/users' component={ListUsers} />
        <Route path='/users/new' component={NewUser} />
        <Route path='/users/:id' component={ShowUser} />

        <Route path='/articles' component={ListArticles} />
        <Route path='/articles/new' component={NewArticle} />
        <Route path='/articles/:id' component={ShowArticle} />

        <Route path='/lectures' component={ListLectures} />
        <Route path='/lectures/new' component={NewLecture} />
        <Route path='/lectures/:id' component={ShowLecture} />

        <Route path='/course_contents' component={ListLecturesContent} />
        <Route path='/course_contents/new' component={NewLecturesContent} />
        <Route path='/course_contents/:id' component={ShowLecturesContent} />

        {/* <Route path='/test' component={ImageUpload}/> */}

      </Route>
    </Route>
  </Router>
)

export default routes