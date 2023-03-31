import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import Root from './components/Root';



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;




