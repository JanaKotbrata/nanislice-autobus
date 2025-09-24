import { useContext, useEffect, useState, useRef } from "react";
import { listUser } from "../services/user-service.js";
import { useAuth } from "../components/providers/auth-context-provider.jsx";
import Avatar from "../components/visual/user/avatar.jsx";
import Button from "../components/visual/button.jsx";
import UserBadge from "../components/visual/user/user-badge.jsx";
import LanguageContext from "../context/language.js";
import PageContainer from "../components/visual/page-container.jsx";
import {
  Roles,
  DEFAULT_NAME,
} from "../../../shared/constants/game-constants.json";

function UsersPage() {
  const i18n = useContext(LanguageContext);
  const { token, user: currentUser } = useAuth();
  const userId = currentUser?.id;

  const [users, setUsers] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  // totalCount nemusí být stav, stačí useRef, hodnota se mění pouze při načtení uživatelů
  const totalCount = useRef(0);
  const pageSize = 4;
  const totalPages = Math.ceil(totalCount.current / pageSize);

  useEffect(() => {
    listUser({ pageInfo: { pageIndex, pageSize } }, token)
      .then((res) => {
        setUsers(res.list);
        totalCount.current = res.pageInfo.totalCount;
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

  const header = (
    <div className="flex items-center justify-center px-10 pt-8 pb-6 border-b border-cyan-700/30 bg-gray-950/60 rounded-t-3xl shadow-md">
      <span className="text-3xl font-bold tracking-wide text-white drop-shadow text-center w-full">
        {i18n.translate("usersTitle")}
      </span>
    </div>
  );

  return (
    <PageContainer header={header}>
      <div className="w-full max-w-7xl mx-auto px-12 sm:px-16 py-8">
        <ul role="list" className="divide-y divide-gray-700">
          {users.map((user) => {
            const isMyself =
              userId === user.id || currentUser.role === Roles.ADMIN;
            return (
              <li
                className="flex flex-col sm:flex-row justify-between gap-4 py-5"
                key={user.id}
              >
                <div className="flex min-w-0 gap-x-4 items-center">
                  <Avatar user={user} isMyself={isMyself} size={"h-14 w-14"} />
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-white break-words">
                      {user.name || i18n.translate(DEFAULT_NAME)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-400 break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 sm:flex-col sm:items-end max-w-full">
                  <p className="text-sm leading-6 text-white">
                    {user.role?.toUpperCase() ||
                      i18n.translate(Roles.PLEB).toUpperCase()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs leading-5 text-gray-400 whitespace-normal break-all">
                    <UserBadge colorClass="bg-yellow-400" label="Level:">
                      {user.level || 0}
                    </UserBadge>
                    <UserBadge colorClass="bg-pink-800" label="XP:">
                      {user.xp || 0}
                    </UserBadge>
                    {user.discordId && (
                      <UserBadge colorClass="bg-blue-900" label="Discord:">
                        <span className="break-all">{user.discordId}</span>
                      </UserBadge>
                    )}
                    {user.googleId && (
                      <UserBadge colorClass="bg-blue-900" label="Google:">
                        <span className="break-all">{user.googleId}</span>
                      </UserBadge>
                    )}
                    {user.seznamId && (
                      <UserBadge colorClass="bg-blue-900" label="Seznam:">
                        <span className="break-all">{user.seznamId}</span>
                      </UserBadge>
                    )}
                    {user.sys && (
                      <>
                        <UserBadge colorClass="bg-green-400" label="Created:">
                          <span className="break-all">{user.sys.cts}</span>
                        </UserBadge>
                        <UserBadge colorClass="bg-green-800" label="Updated:">
                          <span className="break-all">{user.sys.mts}</span>
                        </UserBadge>
                        <UserBadge colorClass="bg-green-900" label="Rev:">
                          <span className="break-all">{user.sys.rev}</span>
                        </UserBadge>
                      </>
                    )}
                    {user.id && (
                      <UserBadge colorClass="bg-red-500" label="ID:">
                        <span className="break-all">{user.id}</span>
                      </UserBadge>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
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
    </PageContainer>
  );
}

export default UsersPage;
