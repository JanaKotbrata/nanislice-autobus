import React, { useContext, useEffect, useState } from "react";
import { listUser } from "../services/user-service.jsx";
import { useAuth } from "../context/auth-context.jsx";
import Avatar from "../components/visual/user/avatar.jsx";
import Button from "../components/visual/button.jsx";
import LogOut from "../components/visual/login/log-out.jsx";
import LanguageContext from "../context/language.js";
import LangSelector from "../components/visual/lang-selector.jsx";
import VolumeSettings from "../components/visual/volume-settings.jsx";

function UsersPage() {
  const i18n = useContext(LanguageContext);
  const { token, user: currentUser } = useAuth();
  const userId = currentUser?.id;

  const [users, setUsers] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 6;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    listUser({ pageInfo: { pageIndex, pageSize } }, token)
      .then((res) => {
        setUsers(res.list);
        setTotalCount(res.pageInfo.totalCount);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [pageIndex, token]);

  function nextPage() {
    if (pageIndex < totalPages - 1) setPageIndex((p) => p + 1);
  }

  function prevPage() {
    if (pageIndex > 0) setPageIndex((p) => p - 1);
  }

  return (
    <div className="bg-gray-900 text-white px-8 py-12">
      <div className="flex flex-row gap-6 justify-end">
        <div className={"p-2"}>
          <VolumeSettings size={22} />
        </div>
        <div className={"p-2"}>
          <LangSelector size={21} />
        </div>
        <LogOut size={21} />
      </div>
      <br />
      <ul role="list" className="divide-y divide-gray-700">
        {users.map((user) => {
          const isMyself = userId === user.id || currentUser.role === "admin";

          return (
            <li className="flex justify-between gap-x-6 py-5" key={user.id}>
              <div className="flex min-w-0 gap-x-4">
                <Avatar user={user} isMyself={isMyself} size={"h-14 w-14"} />
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-white">
                    {user.name || i18n.translate("nemo")}
                  </p>
                  <p className="mt-1 truncate text-xs leading-5 text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end ">
                <p className="text-sm leading-6 text-white">
                  {user.role?.toUpperCase() ||
                    i18n.translate("pleb").toUpperCase()}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-400 flex items-center gap-1">
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-yellow-400" />
                    Level: {user.level || 0}
                  </>

                  <>
                    <span className="flex h-2 w-2 rounded-full bg-pink-800" />{" "}
                    XP: {user.xp || 0}
                  </>
                  {user.discordId && (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-blue-900" />{" "}
                      Discord: {user.discordId}
                    </>
                  )}
                  {user.googleId && (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-blue-900" />{" "}
                      Google: {user.googleId}
                    </>
                  )}
                  {user.seznamId && (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-blue-900" />{" "}
                      Seznam: {user.seznamId}
                    </>
                  )}
                  {user.sys && (
                    <>
                      <>
                        <span className="flex h-2 w-2 rounded-full bg-green-400" />{" "}
                        Vytvořen: {user.sys.cts}
                      </>

                      <>
                        <span className="flex h-2 w-2 rounded-full bg-green-800" />{" "}
                        Upraven: {user.sys.mts}
                      </>
                      <>
                        <span className="flex h-2 w-2 rounded-full bg-green-900" />{" "}
                        Revize: {user.sys.rev}
                      </>
                    </>
                  )}
                  {user.id && (
                    <>
                      <span className="flex h-2 w-2 rounded-full bg-red-500" />
                      ID: {user.id}
                    </>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      {/* Pagination Controls */}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          onClick={prevPage}
          disabled={pageIndex === 0}
          className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50"
        >
          {i18n.translate("previous")}
        </Button>
        <span className="self-center text-sm text-gray-300">
          {i18n.translate("page")} {pageIndex + 1} / {totalPages || 1}
        </span>
        <Button
          onClick={nextPage}
          disabled={pageIndex >= totalPages - 1}
          className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50"
        >
          {i18n.translate("next")}
        </Button>
      </div>
    </div>
  );
}

export default UsersPage;
